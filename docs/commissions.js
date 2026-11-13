/* Public commission page — rendered from site.json, which is edited in the workspace settings. */
'use strict';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const has = (v) => v !== null && v !== undefined && v !== '';

/* Only allow http(s) links on the public page. */
const safeUrl = (u) => (/^https?:\/\//i.test(String(u || '').trim()) ? String(u).trim() : '#');

function priceCell(cur, v) {
  return has(v) ? `<td class="p">${esc(cur)}${esc(v)}</td>` : '<td class="muted">—</td>';
}

function render(c) {
  const t = c.terms || {};
  const cur = c.currency || '$';
  const styles = c.styles || [];
  const links = (c.links || []).filter((l) => l.url);
  const linkBtns = links.map((l) => `<a class="btn" href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.label || l.url)}</a>`).join('');
  const dmLinks = links.slice(0, 2).map((l) => `<a href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join(' or ');
  const minPrice = Math.min(...(c.prices || []).flatMap((r) => styles.map((s) => r.prices && r.prices[s]).filter(has).map(Number)));

  document.title = `${c.name || 'Artist'} Commissions`;

  const formText = [
    `Commission request — ${c.name || ''}`,
    '1. Name / nickname:',
    `2. Type: ${(c.prices || []).map((r) => r.name).join(' / ')}`,
    `3. Style: ${styles.join(' / ')}`,
    '4. Extras:',
    '5. Character references (links):',
    '6. About the character (personality, mood):',
    '7. Pose / expression ideas (or "artist\'s choice"):',
    '8. Personal or commercial use:',
    '9. Can I post it in my portfolio? Yes / Later / No',
    '10. Deadline (if any):',
    '11. PayPal email for the invoice:',
    '☐ I have read and agree to the Terms of Service',
  ].join('\n');

  document.getElementById('page').innerHTML = `
    <section class="hero">
      <span class="open ${c.open ? '' : 'closed'}">${c.open ? 'COMMISSIONS OPEN' : 'COMMISSIONS CLOSED'}</span>
      <h1>${esc(c.name)}<span>.</span></h1>
      <p>${esc(c.tagline)}</p>
      <div class="row">
        ${c.open ? '<a class="btn primary" href="#order">How to order</a>' : ''}
        ${linkBtns}
      </div>
    </section>

    ${(c.gallery || []).length ? `
    <h2>Examples</h2>
    <div class="gallery">
      ${c.gallery.map((g) => `<a class="${g.wide ? 'wide' : ''}" href="${esc(g.src)}" target="_blank"><img src="${esc(g.src)}" alt="${esc(g.alt || 'Artwork example')}" loading="lazy"></a>`).join('')}
    </div>` : ''}

    <h2>Prices <span class="muted small">(${esc(cur === '$' ? 'USD' : cur)})</span></h2>
    <div class="card">
      <table class="price-table">
        <thead><tr><th>Type</th>${styles.map((s) => `<th>${esc(s)}</th>`).join('')}</tr></thead>
        <tbody>
          ${(c.prices || []).map((r) => `
            <tr class="${r.star ? 'star' : ''}">
              <td><b>${r.star ? '⭐ ' : ''}${esc(r.name)}</b>${r.desc ? `<div class="d">${esc(r.desc)}</div>` : ''}</td>
              ${styles.map((s) => priceCell(cur, r.prices && r.prices[s])).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
      ${(c.extras || []).length ? `
      <h3 style="margin-top:14px">Extras</h3>
      <div class="small stack">${c.extras.map((x) => `<div>${esc(x)}</div>`).join('')}</div>` : ''}
    </div>

    <div class="two" style="margin-top:12px">
      <div class="card"><h3>✅ Will draw</h3><div class="small">${esc(c.willDraw)}</div></div>
      <div class="card"><h3>❌ Won't draw</h3><div class="small">${esc(c.wontDraw)}</div></div>
    </div>

    <h2 id="order">How to order</h2>
    <div class="card">
      ${c.open ? `
      <ol class="steps">
        <li>Copy the form below and send it to me in DMs${dmLinks ? ' on ' + dmLinks : ''}.</li>
        <li>I confirm and send you a <b>PayPal invoice</b> (${esc(cur === '$' ? 'USD' : cur)}).</li>
        <li>I send a <b>sketch</b> for approval — up to ${esc(t.revisions)} free revisions.</li>
        <li>I finish the artwork and send you a high-res PNG. ⏳ Usually <b>${esc(t.turnaround)}</b>.</li>
      </ol>
      <div class="tpl">
        <pre id="form">${esc(formText)}</pre>
        <button class="btn primary" id="copyForm">Copy form</button>
      </div>` : `<p>Commissions are <b>closed</b> right now. Follow me to know when they open again! ✨</p>`}
    </div>

    <h2>Terms of Service</h2>
    <details class="tos">
      <summary>Read the full ToS (by ordering you agree to it)</summary>
      <h3>1. General</h3>
      <p>I can decline any commission without giving a reason. Please check my examples before ordering — I draw in my own style. I reply within ${esc(t.replyHours)} hours.</p>
      <h3>2. Payment</h3>
      <p>Prices are in ${esc(cur === '$' ? 'USD' : cur)}, paid via <b>PayPal invoice</b> only. Orders under ${esc(cur)}${esc(t.fullUpfrontUnder)} — full payment upfront. Orders ${esc(cur)}${esc(t.fullUpfrontUnder)}+ — 50% upfront, 50% after the sketch is approved. I start after payment. Invoices must be paid within ${esc(t.payDays)} days, otherwise the slot goes to the next person.</p>
      <h3>3. Revisions</h3>
      <p>Up to ${esc(t.revisions)} free revisions at the sketch stage. At the final stage — small fixes only. Bigger changes after sketch approval: ${esc(t.extraChange)}.</p>
      <h3>4. Turnaround</h3>
      <p>Usually ${esc(t.turnaround)} from payment. Rush (under ${esc(t.rushDays)} days): ${esc(t.rush)}, if I have time. I'll keep you updated.</p>
      <h3>5. Refunds</h3>
      <p>Before the sketch is started — full refund. After the sketch is sent — 50%. After the final is sent — no refund. If I can't finish your commission, you get a full refund for unfinished work. Opening a chargeback without contacting me first means a permanent ban.</p>
      <h3>6. Usage rights</h3>
      <p><b>Allowed:</b> personal use — avatars, banners, personal prints, posting with credit${c.credit ? ` (<code>art by ${esc(c.credit)}</code>)` : ''}, OC references, VTT tokens.<br>
      <b>Needs a commercial license (${esc(t.commercial)}):</b> selling prints/merch, books, games, ads, any paid products.<br>
      <b>Never allowed:</b> AI training or feeding my art into AI tools, NFTs, claiming the art as yours, removing my signature.<br>
      I keep the copyright and may post the work in my portfolio. Want it private? Tell me before ordering (${esc(t.privateFee)}).</p>
      <h3>7. Files</h3>
      <p>You get a high-resolution PNG (${esc(t.minResolution)}px+ on the long side). Please keep your files — I don't guarantee storing them after ${esc(t.storeMonths)} months.</p>
    </details>

    <footer>© ${esc(c.name)} · no AI${isFinite(minPrice) ? ` · prices from ${esc(cur)}${minPrice}` : ''}</footer>`;

  const btn = document.getElementById('copyForm');
  if (btn) btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(formText); } catch (e) {}
    const el = document.getElementById('toast');
    el.textContent = 'Copied ✓'; el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1600);
  });
}

fetch('site.json?t=' + Date.now(), { cache: 'no-store' })
  .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(render)
  .catch(() => {
    document.getElementById('page').innerHTML = '<div class="loading">Could not load the page. Please refresh in a minute.</div>';
  });
