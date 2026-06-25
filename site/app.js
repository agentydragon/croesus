(function () {
  "use strict";

  var SAMPLE_CSV = [
    "date,project,model,input_tokens,output_tokens,cached_tokens,requests,cost_usd,latency_ms",
    "2026-06-01,Support bot,gpt-4.1,821000,143000,52000,1680,78.40,1410",
    "2026-06-02,Support bot,gpt-4.1,808000,151000,61000,1712,77.10,1395",
    "2026-06-03,Support bot,gpt-4.1-mini,620000,112000,241000,1850,18.80,860",
    "2026-06-04,Sales enrichment,claude-sonnet-4,520000,310000,12000,420,92.20,2510",
    "2026-06-05,Sales enrichment,claude-sonnet-4,540000,328000,14000,436,96.50,2600",
    "2026-06-06,Internal search,gpt-4.1-mini,1740000,222000,1020000,6110,38.40,740",
    "2026-06-07,Internal search,gpt-4.1-mini,1810000,240000,1110000,6390,41.20,730",
    "2026-06-08,Agent sandbox,gpt-4.1,2180000,640000,100000,910,210.90,3220",
    "2026-06-09,Agent sandbox,gpt-4.1,2280000,690000,108000,935,225.30,3300",
    "2026-06-10,Agent sandbox,gpt-4.1-mini,2090000,590000,760000,1120,68.40,1850"
  ].join("\n");

  var DEFAULT_CONFIG = {
    stripePaymentLink: "",
    cryptoPaymentUri: "",
    contactEmail: "",
    bookingUrl: "",
    siteUrl: ""
  };

  var state = {
    rows: [],
    report: null
  };

  function getConfig() {
    return Object.assign({}, DEFAULT_CONFIG, window.CROESUS_CONFIG || {});
  }

  function $(id) {
    return document.getElementById(id);
  }

  function currency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(Math.round(value || 0));
  }

  function decimal(value) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value || 0);
  }

  function parseCsv(text) {
    var rows = [];
    var row = [];
    var current = "";
    var inQuotes = false;

    for (var i = 0; i < text.length; i += 1) {
      var char = text[i];
      var next = text[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(current);
        current = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") {
          i += 1;
        }
        row.push(current);
        current = "";
        if (row.some(function (cell) { return cell.trim() !== ""; })) {
          rows.push(row);
        }
        row = [];
      } else {
        current += char;
      }
    }

    row.push(current);
    if (row.some(function (cell) { return cell.trim() !== ""; })) {
      rows.push(row);
    }

    if (rows.length < 2) {
      return [];
    }

    var headers = rows[0].map(function (header) {
      return normalizeHeader(header);
    });

    return rows.slice(1).map(function (cells) {
      var item = {};
      headers.forEach(function (header, index) {
        item[header] = cells[index] || "";
      });
      return item;
    });
  }

  function normalizeHeader(header) {
    return String(header || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function asNumber(row, keys) {
    for (var i = 0; i < keys.length; i += 1) {
      var value = row[keys[i]];
      if (value !== undefined && value !== "") {
        var parsed = Number(String(value).replace(/[$,\s]/g, ""));
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }
    return 0;
  }

  function asString(row, keys, fallback) {
    for (var i = 0; i < keys.length; i += 1) {
      var value = row[keys[i]];
      if (value !== undefined && String(value).trim() !== "") {
        return String(value).trim();
      }
    }
    return fallback;
  }

  function normalizeRows(rows) {
    return rows.map(function (row, index) {
      var inputTokens = asNumber(row, ["input_tokens", "prompt_tokens", "input", "prompt"]);
      var outputTokens = asNumber(row, ["output_tokens", "completion_tokens", "output", "completion"]);
      var cachedTokens = asNumber(row, ["cached_tokens", "cache_read_tokens", "cached_input_tokens"]);
      var requests = asNumber(row, ["requests", "request_count", "calls"]);
      var cost = asNumber(row, ["cost_usd", "cost", "spend_usd", "amount"]);
      var latency = asNumber(row, ["latency_ms", "p95_latency_ms", "duration_ms"]);

      return {
        id: index,
        date: asString(row, ["date", "day", "created_at"], ""),
        project: asString(row, ["project", "team", "app", "application", "feature"], "Unlabeled"),
        model: asString(row, ["model", "model_name", "engine"], "unknown"),
        inputTokens: inputTokens,
        outputTokens: outputTokens,
        cachedTokens: cachedTokens,
        requests: requests,
        cost: cost,
        latency: latency
      };
    });
  }

  function analyze(rows, monthlySpend, hourValue, reviewFee) {
    var totalObservedCost = sum(rows, "cost");
    var totalSpend = monthlySpend > 0 ? monthlySpend : totalObservedCost;
    var totalTokens = rows.reduce(function (acc, row) {
      return acc + row.inputTokens + row.outputTokens;
    }, 0);
    var cacheableInput = rows.reduce(function (acc, row) {
      return acc + Math.max(0, row.inputTokens - row.cachedTokens);
    }, 0);
    var cachedTokens = sum(rows, "cachedTokens");
    var expensiveRows = rows.filter(function (row) {
      return /gpt-4\.1$|sonnet|opus|o1|o3/i.test(row.model);
    });
    var premiumSpend = sum(expensiveRows, "cost");
    var premiumShare = totalObservedCost ? premiumSpend / totalObservedCost : 0;
    var largeContextRows = rows.filter(function (row) {
      return row.requests > 0 && row.inputTokens / row.requests > 1200;
    });
    var lowCacheShare = cacheableInput > 0 ? cachedTokens / (cacheableInput + cachedTokens) : 0;
    var spikeRows = detectSpikes(rows);
    var findings = [];

    var modelMixSavings = totalSpend * Math.min(0.28, premiumShare * 0.35);
    if (modelMixSavings > 25) {
      findings.push({
        severity: "high",
        title: "Premium model traffic looks routable",
        value: modelMixSavings,
        text:
          "Premium models account for " +
          Math.round(premiumShare * 100) +
          "% of observed spend. Route low-risk extraction, summaries, and search tasks to cheaper models before using the premium path."
      });
    }

    var promptSavings = totalTokens > 0 ? totalSpend * Math.min(0.18, largeContextRows.length / Math.max(rows.length, 1) * 0.22) : 0;
    if (promptSavings > 20) {
      findings.push({
        severity: "medium",
        title: "Context windows are likely oversized",
        value: promptSavings,
        text:
          largeContextRows.length +
          " rows average more than 1,200 input tokens per request. Trim repeated instructions, add retrieval caps, and log prompt templates by feature."
      });
    }

    var cacheSavings = totalSpend * Math.max(0, 0.16 - lowCacheShare * 0.16);
    if (cacheSavings > 20) {
      findings.push({
        severity: "medium",
        title: "Prompt caching is underused",
        value: cacheSavings,
        text:
          "Only " +
          Math.round(lowCacheShare * 100) +
          "% of eligible input tokens appear cached. Stable system prompts and repeated retrieval prefixes should be cache-friendly."
      });
    }

    if (spikeRows.length > 0) {
      var spikeCost = sum(spikeRows, "cost");
      findings.push({
        severity: "high",
        title: "Spend spikes need budget guards",
        value: Math.max(spikeCost * 0.45, totalSpend * 0.04),
        text:
          spikeRows.length +
          " usage rows are more than 2.2x the median row cost. Add per-feature budgets and alert before runaway agent loops hit production invoices."
      });
    }

    if (findings.length === 0) {
      findings.push({
        severity: "good",
        title: "No obvious waste pattern in this sample",
        value: Math.max(totalSpend * 0.03, 25),
        text:
          "The next audit step is segmenting by user journey and checking whether expensive calls map to revenue-bearing workflows."
      });
    }

    var estimatedWaste = findings.reduce(function (acc, finding) {
      return acc + finding.value;
    }, 0);
    estimatedWaste = Math.min(estimatedWaste, totalSpend * 0.42);
    var analystTimeValue = Math.min(6 * hourValue, estimatedWaste * 0.5);
    var netUpside = Math.max(0, estimatedWaste + analystTimeValue - reviewFee);

    return {
      totalObservedCost: totalObservedCost,
      totalSpend: totalSpend,
      estimatedWaste: estimatedWaste,
      analystTimeValue: analystTimeValue,
      netUpside: netUpside,
      payback: reviewFee > 0 ? netUpside / reviewFee : 0,
      findings: findings.sort(function (a, b) { return b.value - a.value; }),
      modelSpend: groupByModel(rows)
    };
  }

  function sum(rows, key) {
    return rows.reduce(function (acc, row) {
      return acc + (Number(row[key]) || 0);
    }, 0);
  }

  function groupByModel(rows) {
    var grouped = {};
    rows.forEach(function (row) {
      grouped[row.model] = (grouped[row.model] || 0) + row.cost;
    });
    return Object.keys(grouped)
      .map(function (model) {
        return { model: model, cost: grouped[model] };
      })
      .sort(function (a, b) { return b.cost - a.cost; });
  }

  function detectSpikes(rows) {
    var costs = rows
      .map(function (row) { return row.cost; })
      .filter(function (cost) { return cost > 0; })
      .sort(function (a, b) { return a - b; });
    if (costs.length < 4) {
      return [];
    }
    var median = costs[Math.floor(costs.length / 2)];
    return rows.filter(function (row) {
      return row.cost > median * 2.2 && row.cost > 50;
    });
  }

  function render(report) {
    $("waste-total").textContent = currency(report.estimatedWaste);
    $("net-upside").textContent = currency(report.netUpside);
    $("payback").textContent = decimal(report.payback) + "x";
    $("report-title").textContent = "Potential savings report";
    $("data-status").textContent = state.rows.length + " rows analyzed";
    renderFindings(report.findings);
    renderChart(report.modelSpend);
    renderLinks(report);
  }

  function renderFindings(findings) {
    $("findings-list").innerHTML = findings
      .map(function (finding) {
        return [
          '<article class="finding ' + escapeHtml(finding.severity) + '">',
          "<strong>" + escapeHtml(finding.title) + " - " + currency(finding.value) + "/mo</strong>",
          "<p>" + escapeHtml(finding.text) + "</p>",
          "</article>"
        ].join("");
      })
      .join("");
  }

  function renderChart(items) {
    var canvas = $("spend-chart");
    var context = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    var padding = 34;
    var chartWidth = width - padding * 2;
    var chartHeight = height - padding * 2;
    var max = Math.max.apply(null, items.map(function (item) { return item.cost; }).concat([1]));
    var palette = ["#0e6f65", "#3568a8", "#c28621", "#b23b31", "#25734f", "#6b5b95"];

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "#dce3dc";
    context.lineWidth = 1;
    for (var i = 0; i <= 4; i += 1) {
      var y = padding + (chartHeight / 4) * i;
      context.beginPath();
      context.moveTo(padding, y);
      context.lineTo(width - padding, y);
      context.stroke();
    }

    var barGap = 18;
    var barWidth = Math.max(34, (chartWidth - barGap * Math.max(items.length - 1, 0)) / Math.max(items.length, 1));
    items.forEach(function (item, index) {
      var barHeight = (item.cost / max) * (chartHeight - 36);
      var x = padding + index * (barWidth + barGap);
      var y = height - padding - barHeight;
      context.fillStyle = palette[index % palette.length];
      context.fillRect(x, y, barWidth, barHeight);
      context.fillStyle = "#17211c";
      context.font = "700 18px Inter, sans-serif";
      context.fillText(currency(item.cost), x, y - 10);
      context.fillStyle = "#5f6f66";
      context.font = "700 14px Inter, sans-serif";
      context.fillText(trimLabel(item.model, 18), x, height - 12);
    });

    if (items.length === 0) {
      context.fillStyle = "#5f6f66";
      context.font = "700 18px Inter, sans-serif";
      context.fillText("Load CSV data to render model spend", padding, height / 2);
    }
  }

  function trimLabel(value, maxLength) {
    if (value.length <= maxLength) {
      return value;
    }
    return value.slice(0, maxLength - 1) + "...";
  }

  function renderLinks(report) {
    var config = getConfig();
    var paymentUrl = cleanUrl(config.stripePaymentLink) || cleanUrl(config.cryptoPaymentUri);
    var contactEmail = cleanEmail(config.contactEmail);
    var bookingUrl = cleanUrl(config.bookingUrl);
    var checkoutReady = Boolean(paymentUrl);
    var contactReady = Boolean(contactEmail || bookingUrl);
    var subject = encodeURIComponent("AI spend audit CSV");
    var body = encodeURIComponent(
      "I want the monthly AI spend review.\n\nEstimated monthly waste from Croesus: " +
        currency(report.estimatedWaste) +
        "\nNet first-month upside: " +
        currency(report.netUpside)
    );
    var mailto = contactEmail ? "mailto:" + encodeURIComponent(contactEmail) + "?subject=" + subject + "&body=" + body : "";

    setLinkState($("pay-link"), checkoutReady || contactReady, paymentUrl || mailto || "#", checkoutReady ? "Pay monthly" : "Request payment link");
    setLinkState($("contact-link"), contactReady, bookingUrl || mailto || "#", bookingUrl ? "Book review" : "Send CSV");
    $("launch-warning").classList.toggle("is-hidden", checkoutReady && contactReady);
  }

  function setLinkState(element, enabled, href, label) {
    element.href = href;
    element.textContent = label;
    element.classList.toggle("is-disabled", !enabled);
    element.setAttribute("aria-disabled", enabled ? "false" : "true");
  }

  function cleanUrl(value) {
    var text = String(value || "").trim();
    if (!text || text.indexOf("example.") !== -1 || text.indexOf("buy.stripe.com/...") !== -1) {
      return "";
    }
    return text;
  }

  function cleanEmail(value) {
    var text = String(value || "").trim();
    if (!text || /example\.com$/i.test(text)) {
      return "";
    }
    return text;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function analyzeInput() {
    var text = $("csv-input").value.trim();
    var parsed = normalizeRows(parseCsv(text));
    state.rows = parsed;
    state.report = analyze(
      parsed,
      Number($("monthly-spend").value),
      Number($("hour-value").value),
      Number($("review-fee").value)
    );
    render(state.report);
  }

  function setup() {
    $("csv-input").value = SAMPLE_CSV;
    $("load-sample").addEventListener("click", function () {
      $("csv-input").value = SAMPLE_CSV;
      analyzeInput();
    });
    $("csv-file").addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) {
        return;
      }
      file.text().then(function (text) {
        $("csv-input").value = text;
        analyzeInput();
      });
    });
    $("audit-form").addEventListener("submit", function (event) {
      event.preventDefault();
      analyzeInput();
    });
    analyzeInput();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }

  window.Croesus = {
    parseCsv: parseCsv,
    normalizeRows: normalizeRows,
    analyze: analyze
  };
})();
