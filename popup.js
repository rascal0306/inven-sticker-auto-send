document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('stickerId');
    const btn = document.getElementById('saveBtn');
    const status = document.getElementById('status');

    // 1. 저장된 값 불러오기 (기본값 800)
    chrome.storage.local.get(['targetStickerId'], (result) => {
        if (result.targetStickerId) {
            input.value = result.targetStickerId;
        } else {
            input.value = 800; // 기본값
        }
    });

    // 2. 저장 버튼 클릭 이벤트
    btn.addEventListener('click', () => {
        const val = input.value.trim();
        if (!val) {
            status.textContent = "숫자를 입력해주세요.";
            status.style.color = "red";
            return;
        }

        chrome.storage.local.set({ targetStickerId: val }, () => {
            status.textContent = "저장되었습니다!";
            status.style.color = "blue";
            setTimeout(() => { status.textContent = ""; }, 2000);
        });
    });
});