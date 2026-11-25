export default {
  async fetch(request) {
    const url = new URL(request.url);
    const cf = request.cf || {};

    if (url.pathname === "/api/health") {
      return new Response(
        JSON.stringify(
          {
            status: "Online",
            app: "Serverless Split Bill & Finance Studio",
            edge_colo: cf.colo || "Unknown",
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
        { headers: { "content-type": "application/json;charset=UTF-8" } }
      );
    }

    if (url.pathname === "/api/split") {
      const subtotal = Math.max(0, Number(url.searchParams.get("subtotal") || 0));
      const taxPct = Math.max(0, Number(url.searchParams.get("tax") || 0));
      const people = Math.max(1, Math.floor(Number(url.searchParams.get("people") || 1)));

      const taxAmount = (subtotal * taxPct) / 100;
      const grandTotal = subtotal + taxAmount;
      const perPerson = grandTotal / people;

      return new Response(
        JSON.stringify(
          {
            subtotal: Math.round(subtotal),
            tax_percent: taxPct,
            tax_amount: Math.round(taxAmount),
            grand_total: Math.round(grandTotal),
            people,
            per_person: Math.round(perPerson),
          },
          null,
          2
        ),
        { headers: { "content-type": "application/json;charset=UTF-8" } }
      );
    }

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Split Bill & Kalkulator Keuangan — Serverless</title>
  <style>
    :root {
      --bg: #0b1120;
      --card: #111827;
      --card-2: #1e293b;
      --border: #283548;
      --text: #f8fafc;
      --muted: #94a3b8;
      --accent: #38bdf8;
      --danger: #f87171;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: radial-gradient(circle at top, #172554 0%, var(--bg) 55%);
      color: var(--text);
      min-height: 100vh;
      padding: 2rem 1rem 3rem;
    }
    .container { max-width: 980px; margin: 0 auto; }
    header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    h1 { margin: 0; font-size: 1.6rem; letter-spacing: -0.02em; }
    .subtitle { margin: 0.25rem 0 0; color: var(--muted); font-size: 0.92rem; }
    .badge {
      background: rgba(56, 189, 248, 0.14);
      border: 1px solid rgba(56, 189, 248, 0.35);
      color: #7dd3fc;
      padding: 0.4rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; }
    .tab-btn {
      background: var(--card);
      color: var(--muted);
      border: 1px solid var(--border);
      padding: 0.65rem 1.1rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .tab-btn.active {
      background: var(--accent);
      color: #082f49;
      border-color: var(--accent);
    }
    .panel { display: none; }
    .panel.active { display: block; }
    .grid {
      display: grid;
      grid-template-columns: 1.25fr 0.95fr;
      gap: 1.25rem;
    }
    @media (max-width: 820px) { .grid { grid-template-columns: 1fr; } }
    .card {
      background: rgba(17, 24, 39, 0.92);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.35rem;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
    }
    .card h2 { margin: 0 0 1rem; font-size: 1.1rem; }
    .row-form {
      display: grid;
      grid-template-columns: 2fr 1fr 0.8fr auto;
      gap: 0.6rem;
      margin-bottom: 1rem;
    }
    @media (max-width: 640px) {
      .row-form { grid-template-columns: 1fr 1fr; }
      .row-form button { grid-column: span 2; }
    }
    input {
      width: 100%;
      background: var(--card-2);
      color: var(--text);
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 0.65rem 0.75rem;
      font-size: 0.9rem;
    }
    input:focus { outline: none; border-color: var(--accent); }
    button.primary {
      background: var(--accent);
      color: #082f49;
      border: none;
      border-radius: 10px;
      padding: 0.65rem 1rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }
    button.secondary {
      background: var(--card-2);
      color: var(--text);
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 0.55rem 0.85rem;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
    }
    button.del-btn {
      background: transparent;
      color: var(--danger);
      border: none;
      cursor: pointer;
      font-weight: 700;
      padding: 0.25rem 0.5rem;
    }
    .item-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      max-height: 310px;
      overflow-y: auto;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--card-2);
      border: 1px solid #293548;
      border-radius: 10px;
      padding: 0.7rem 0.85rem;
      gap: 0.75rem;
    }
    .item-title { font-weight: 600; font-size: 0.92rem; }
    .item-meta { color: var(--muted); font-size: 0.8rem; margin-top: 0.15rem; }
    .item-right { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; }
    .controls-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    label {
      display: block;
      font-size: 0.8rem;
      color: var(--muted);
      margin-bottom: 0.3rem;
    }
    .summary-box {
      background: var(--card-2);
      border-radius: 12px;
      padding: 1rem;
      border: 1px solid #334155;
    }
    .sum-line {
      display: flex;
      justify-content: space-between;
      padding: 0.45rem 0;
      font-size: 0.92rem;
      border-bottom: 1px dashed #334155;
    }
    .sum-line:last-child { border-bottom: none; }
    .highlight {
      margin-top: 0.9rem;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.35);
      border-radius: 12px;
      padding: 0.9rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .highlight .big { font-size: 1.25rem; font-weight: 800; color: #4ade80; }
    .actions-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin-top: 1rem;
      align-items: center;
    }
    .api-link { color: #7dd3fc; font-size: 0.85rem; text-decoration: none; }
    .api-link:hover { text-decoration: underline; }
    .empty {
      color: var(--muted);
      text-align: center;
      padding: 1.5rem 0.5rem;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>💸 Split Bill & Kalkulator Keuangan</h1>
        <p class="subtitle">Aplikasi keuangan interaktif di atas Cloudflare Workers</p>
      </div>
      <div class="badge">Edge Node: ${cf.colo || "Global"}</div>
    </header>

    <div class="tabs">
      <button class="tab-btn active" data-tab="split">Split Bill & Tagihan</button>
      <button class="tab-btn" data-tab="installment">Simulasi Cicilan</button>
    </div>

    <section id="panel-split" class="panel active">
      <div class="grid">
        <div class="card">
          <h2>Daftar Item / Pengeluaran</h2>
          <form id="item-form" class="row-form">
            <input id="item-name" type="text" placeholder="Contoh: Nasi Goreng / Kopi" required />
            <input id="item-price" type="number" min="0" step="100" placeholder="Harga (Rp)" required />
            <input id="item-shares" type="number" min="1" step="1" value="1" title="Jumlah orang/porsi" required />
            <button type="submit" class="primary">+ Tambah</button>
          </form>

          <div id="item-list" class="item-list"></div>

          <div class="actions-bar">
            <button type="button" id="sample-btn" class="secondary">Isi Contoh Data</button>
            <button type="button" id="clear-btn" class="secondary">Hapus Semua</button>
          </div>
        </div>

        <div class="card">
          <h2>Ringkasan Patungan</h2>
          <div class="controls-grid">
            <div>
              <label for="people-count">Total Orang Patungan</label>
              <input id="people-count" type="number" min="1" value="2" />
            </div>
            <div>
              <label for="tax-pct">Pajak & Layanan (%)</label>
              <input id="tax-pct" type="number" min="0" max="100" step="0.5" value="10" />
            </div>
          </div>

          <div class="summary-box">
            <div class="sum-line">
              <span>Subtotal Item</span>
              <strong id="sum-subtotal">Rp0</strong>
            </div>
            <div class="sum-line">
              <span>Pajak & Layanan</span>
              <strong id="sum-tax">Rp0</strong>
            </div>
            <div class="sum-line">
              <span>Total Tagihan</span>
              <strong id="sum-grand">Rp0</strong>
            </div>
          </div>

          <div class="highlight">
            <div>
              <div style="font-size: 0.82rem; color: #bbf7d0;">Bayar per Orang</div>
              <div style="font-size: 0.78rem; color: var(--muted);" id="per-person-note">Dibagi 2 orang</div>
            </div>
            <div class="big" id="sum-per-person">Rp0</div>
          </div>

          <div class="actions-bar">
            <button type="button" id="copy-summary-btn" class="secondary">Salin Ringkasan</button>
            <a id="api-preview-link" class="api-link" href="/api/split?subtotal=0&tax=10&people=2" target="_blank">Buka JSON /api/split ↗</a>
          </div>
        </div>
      </div>
    </section>

    <section id="panel-installment" class="panel">
      <div class="card" style="max-width: 640px;">
        <h2>Simulasi Cicilan Flat</h2>
        <div class="controls-grid">
          <div>
            <label for="loan-amount">Pokok Pinjaman / Harga Barang (Rp)</label>
            <input id="loan-amount" type="number" min="0" step="10000" value="3000000" />
          </div>
          <div>
            <label for="loan-tenor">Tenor (Bulan)</label>
            <input id="loan-tenor" type="number" min="1" max="120" value="6" />
          </div>
          <div style="grid-column: span 2;">
            <label for="loan-rate">Bunga per Tahun (%)</label>
            <input id="loan-rate" type="number" min="0" max="100" step="0.5" value="12" />
          </div>
        </div>

        <div class="summary-box">
          <div class="sum-line">
            <span>Total Bunga Estimasi</span>
            <strong id="inst-interest">Rp0</strong>
          </div>
          <div class="sum-line">
            <span>Total Pembayaran</span>
            <strong id="inst-total">Rp0</strong>
          </div>
        </div>

        <div class="highlight">
          <div>
            <div style="font-size: 0.82rem; color: #bbf7d0;">Cicilan per Bulan</div>
            <div style="font-size: 0.78rem; color: var(--muted);">Perhitungan bunga flat</div>
          </div>
          <div class="big" id="inst-monthly">Rp0</div>
        </div>
      </div>
    </section>
  </div>

  <script>
    const STORAGE_KEY = "edge_split_bill_items_v1";
    const fmtIDR = (n) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Math.round(Number(n) || 0));

    let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || [
      { id: 1, name: "Kopi Susu Gula Aren", price: 54000, shares: 2 },
      { id: 2, name: "Nasi Goreng Spesial", price: 66000, shares: 2 },
    ];

    const tabBtns = document.querySelectorAll(".tab-btn");
    const panels = {
      split: document.getElementById("panel-split"),
      installment: document.getElementById("panel-installment"),
    };

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        Object.values(panels).forEach((p) => p.classList.remove("active"));
        panels[btn.dataset.tab].classList.add("active");
      });
    });

    const itemForm = document.getElementById("item-form");
    const itemName = document.getElementById("item-name");
    const itemPrice = document.getElementById("item-price");
    const itemShares = document.getElementById("item-shares");
    const itemList = document.getElementById("item-list");
    const peopleInput = document.getElementById("people-count");
    const taxInput = document.getElementById("tax-pct");

    function saveAndRender() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      renderSplit();
    }

    function renderSplit() {
      if (!items.length) {
        itemList.innerHTML = '<div class="empty">Belum ada item. Tambahkan pengeluaran di atas.</div>';
      } else {
        itemList.innerHTML = items
          .map(
            (it) => \`
          <div class="item-row">
            <div>
              <div class="item-title">\${escapeHtml(it.name)}</div>
              <div class="item-meta">Porsi/orang: \${it.shares}</div>
            </div>
            <div class="item-right">
              <span>\${fmtIDR(it.price)}</span>
              <button class="del-btn" data-id="\${it.id}" title="Hapus">✕</button>
            </div>
          </div>\`
          )
          .join("");
      }

      itemList.querySelectorAll(".del-btn").forEach((b) => {
        b.addEventListener("click", () => {
          items = items.filter((x) => String(x.id) !== b.dataset.id);
          saveAndRender();
        });
      });

      const subtotal = items.reduce((acc, cur) => acc + Number(cur.price || 0), 0);
      const taxPct = Math.max(0, Number(taxInput.value || 0));
      const people = Math.max(1, Math.floor(Number(peopleInput.value || 1)));

      const taxAmount = (subtotal * taxPct) / 100;
      const grandTotal = subtotal + taxAmount;
      const perPerson = grandTotal / people;

      document.getElementById("sum-subtotal").textContent = fmtIDR(subtotal);
      document.getElementById("sum-tax").textContent = fmtIDR(taxAmount);
      document.getElementById("sum-grand").textContent = fmtIDR(grandTotal);
      document.getElementById("sum-per-person").textContent = fmtIDR(perPerson);
      document.getElementById("per-person-note").textContent = "Dibagi " + people + " orang";

      const apiLink = document.getElementById("api-preview-link");
      apiLink.href =
        "/api/split?subtotal=" +
        Math.round(subtotal) +
        "&tax=" +
        taxPct +
        "&people=" +
        people;
    }

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m]));
    }

    itemForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = itemName.value.trim();
      const price = Number(itemPrice.value);
      const shares = Math.max(1, Math.floor(Number(itemShares.value || 1)));
      if (!name || isNaN(price) || price < 0) return;

      items.push({ id: Date.now(), name, price, shares });
      itemName.value = "";
      itemPrice.value = "";
      itemShares.value = "1";
      saveAndRender();
    });

    peopleInput.addEventListener("input", renderSplit);
    taxInput.addEventListener("input", renderSplit);

    document.getElementById("sample-btn").addEventListener("click", () => {
      items = [
        { id: 101, name: "Makan Malam Tim", price: 240000, shares: 4 },
        { id: 102, name: "Minuman & Dessert", price: 95000, shares: 4 },
        { id: 103, name: "Ongkos Kirim / Parkir", price: 25000, shares: 4 },
      ];
      peopleInput.value = "4";
      taxInput.value = "10";
      saveAndRender();
    });

    document.getElementById("clear-btn").addEventListener("click", () => {
      items = [];
      saveAndRender();
    });

    document.getElementById("copy-summary-btn").addEventListener("click", async () => {
      const text = [
        "Ringkasan Split Bill:",
        "- Subtotal: " + document.getElementById("sum-subtotal").textContent,
        "- Pajak/Layanan: " + document.getElementById("sum-tax").textContent,
        "- Total: " + document.getElementById("sum-grand").textContent,
        "- Per Orang: " + document.getElementById("sum-per-person").textContent,
      ].join("\\n");
      try {
        await navigator.clipboard.writeText(text);
        alert("Ringkasan berhasil disalin!");
      } catch {
        alert("Gagal menyalin otomatis, silakan blok teks ringkasan.");
      }
    });

    const loanAmount = document.getElementById("loan-amount");
    const loanTenor = document.getElementById("loan-tenor");
    const loanRate = document.getElementById("loan-rate");

    function renderInstallment() {
      const principal = Math.max(0, Number(loanAmount.value || 0));
      const months = Math.max(1, Math.floor(Number(loanTenor.value || 1)));
      const annualRate = Math.max(0, Number(loanRate.value || 0));

      const totalInterest = principal * (annualRate / 100) * (months / 12);
      const totalPayment = principal + totalInterest;
      const monthly = totalPayment / months;

      document.getElementById("inst-interest").textContent = fmtIDR(totalInterest);
      document.getElementById("inst-total").textContent = fmtIDR(totalPayment);
      document.getElementById("inst-monthly").textContent = fmtIDR(monthly);
    }

    loanAmount.addEventListener("input", renderInstallment);
    loanTenor.addEventListener("input", renderInstallment);
    loanRate.addEventListener("input", renderInstallment);

    renderSplit();
    renderInstallment();
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },
};
