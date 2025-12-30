// 測試後端連接
fetch('https://yhere-backend.onrender.com/spots?country=HK')
  .then(res => res.json())
  .then(data => {
    document.getElementById('status').innerText = data.message;
  })
  .catch(err => {
    document.getElementById('status').innerText = '後端連接失敗';
  });

// 初始化地圖（世界視角）
const map = L.map('map').setView([20, 0], 2);

// 加入地圖圖磚
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

let markers = [];

// 根據國家移動地圖中心
function focusCountry(country) {
  if (country === "HK") {
    map.setView([22.3193, 114.1694], 11);
  } else if (country === "JP") {
    map.setView([35.6895, 139.6917], 10); // 東京
  } else if (country === "KR") {
    map.setView([37.5665, 126.9780], 11); // 首爾
  } else if (country === "TW") {
    map.setView([25.0330, 121.5654], 11); // 台北
  } else {
    map.setView([20, 0], 2);
  }
}

// 清除舊 marker
function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

// 載入某國家景點
async function loadSpots(country) {
  if (!country) return;

  focusCountry(country);

  const res = await fetch(`https://yhere-backend.onrender.com/spots?country=${country}`);
  const spots = await res.json();

  clearMarkers();

  spots.forEach(spot => {
    const marker = L.marker([spot.lat, spot.lng]).addTo(map);

    const popupHtml = `
      <div style="text-align:left; max-width:200px;">
        <img src="${spot.thumbnail}" style="width:100%; border-radius:4px; margin-bottom:4px;" />
        <b>${spot.name}</b><br/>
        <span style="font-size:12px; color:#666;">${spot.city || ''}</span><br/>
        <span style="font-size:13px;">${spot.description}</span><br/>
        <button onclick="openDetails(${spot.id})" style="margin-top:6px; padding:4px 6px; font-size:12px; cursor:pointer;">
          查看詳情
        </button>
      </div>
    `;

    marker.bindPopup(popupHtml);
    markers.push(marker);
  });
}

// 國家選單事件
document.getElementById('countrySelect').addEventListener('change', function () {
  const country = this.value;
  loadSpots(country);
  clearDetails();
});

// 清除右側詳情
function clearDetails() {
  const panel = document.getElementById('detailsPanel');
  panel.classList.add('empty');
  panel.innerHTML = '請在地圖上選擇一個景點';
}

// 打開詳情（給 popup 裏面的 button 用）
window.openDetails = async function (id) {
  const res = await fetch(`https://yhere-backend.onrender.com/spots/${id}`);
  const spot = await res.json();

  const panel = document.getElementById('detailsPanel');
  panel.classList.remove('empty');

  panel.innerHTML = `
    <img src="${spot.thumbnail}" class="spot-image" />
    <h2 class="spot-title">${spot.name}</h2>
    <div class="spot-city">${spot.city || ''}</div>

    <div class="section-title">景點介紹</div>
    <div>${spot.description}</div>

    <div class="section-title">歷史背景</div>
    <div>${spot.history || '（暫無資料）'}</div>

    <div class="section-title">用戶評價</div>
    <div id="reviewsList">
      ${spot.reviews.length > 0
        ? spot.reviews.map(r => `
            <div class="review-item">
              <b>${r.user_name}</b> - ${"★".repeat(r.rating)}<br/>
              ${r.comment}
            </div>
          `).join('')
        : '<div>暫時未有評價。</div>'
      }
    </div>

    <div class="section-title">留下你的評價</div>
    <form id="reviewForm">
      <input type="text" id="reviewUser" placeholder="你的名字（可留空）" />
      <input type="number" id="reviewRating" min="1" max="5" placeholder="評分（1-5）" />
      <textarea id="reviewComment" rows="3" placeholder="評論內容"></textarea>
      <button type="submit">提交評論</button>
    </form>

    <div class="section-title">相關旅遊產品</div>
    <div id="productsList">
      ${spot.products && spot.products.length > 0
        ? spot.products.map(p => `
            <a href="${p.url}" class="product-link" target="_blank">
              [${p.provider}] ${p.name}
            </a>
          `).join('')
        : '<div>暫時未有相關產品。</div>'
      }
    </div>
  `;

  // 評價提交
  const form = document.getElementById('reviewForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('reviewUser').value || '匿名';
    const rating = Number(document.getElementById('reviewRating').value || 5);
    const comment = document.getElementById('reviewComment').value;

    const res = await fetch(`https://yhere-backend.onrender.com/spots/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, rating, comment })
    });

    const data = await res.json();

    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = data.reviews.map(r => `
      <div class="review-item">
        <b>${r.user_name}</b> - ${"★".repeat(r.rating)}<br/>
        ${r.comment}
      </div>
    `).join('');

    form.reset();
  });
};
