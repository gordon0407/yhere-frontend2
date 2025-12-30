// 你的 Supabase 設定
const supabase = Window.supabase.createClient('http://micyilnlilkwbehahgdw.supabase.co', sb_publishable_en6plLqL793C5orBlvobRw_BO8vT3Yy);

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  errorMsg.innerText = "";

  if (!email || !password) {
    errorMsg.innerText = "請輸入 Email 和密碼";
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    errorMsg.innerText = "登入失敗：" + error.message;
    return;
  }

  // 登入成功 → 跳返首頁
  window.location.href = "index.html";
});

// Google 登入
document.getElementById("googleBtn").addEventListener("click", async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google"
  });

  if (error) {
    document.getElementById("errorMsg").innerText = "Google 登入失敗：" + error.message;
  }
});
