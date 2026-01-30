// URL에서 닉네임 파라미터 확인
const urlParams = new URLSearchParams(window.location.search);
const targetNick = urlParams.get('auto_bg_gift');

if (targetNick) {
    
    // 알림창 가로채기
    const interceptorScript = document.createElement('script');
    interceptorScript.textContent = `
        window.alert = function(msg) {
            window.dispatchEvent(new CustomEvent('INVEN_ALERT_DETECTED', { detail: msg }));
            return true;
        };
        window.confirm = function(msg) {
            return true; 
        };
    `;
    (document.head || document.documentElement).appendChild(interceptorScript);

    window.addEventListener('INVEN_ALERT_DETECTED', function(e) {
        console.log(`[알림 감지] ${e.detail}`);
        chrome.runtime.sendMessage({ action: "close_window" });
    });

    (async () => {
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));
        await sleep(50);

        // 1. '선물하기' 탭 활성화
        // (대부분의 스티커 페이지 구조가 동일하므로 class로 찾습니다)
        const giftTabBtn = document.querySelector('.sticker-gift[data-type="2"]');
        if (giftTabBtn) giftTabBtn.click();
        await sleep(30);

        // 2. 닉네임 입력
        const input = document.querySelector('#sticker-gift-search input[name="nickName"]');
        if (input) {
            input.value = targetNick;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // 3. 검색 버튼 클릭
        const searchBtn = document.querySelector('#sticker-gift-search .find-btn');
        if (searchBtn) searchBtn.click();

        // 4. 유저 검색 대기
        let found = false;
        for (let i = 0; i < 20; i++) {
            await sleep(50);
            const userLayer = document.querySelector('.purchase-user');
            const userImg = document.querySelector('#user-image');
            
            if (userLayer && userLayer.style.display !== 'none' && userImg && userImg.src) {
                found = true;
                break;
            }
        }

        if (!found) {
            chrome.runtime.sendMessage({ action: "close_window" });
            return;
        }

        // 5. 결제하기
        const payBtn = document.querySelector('#product-purchase-gift .sticker-gift-send');
        if (payBtn) {
            payBtn.click();
        } else {
            chrome.runtime.sendMessage({ action: "close_window" });
        }

        await sleep(50);
        chrome.runtime.sendMessage({ action: "close_window" });

    })();
}