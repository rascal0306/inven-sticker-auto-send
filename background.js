chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 선물 프로세스 시작 요청
    if (request.action === "start_gift_process") {
        const nickname = request.nickname;
        
        // [변경] 저장된 스티커 ID를 가져옵니다.
        chrome.storage.local.get(['targetStickerId'], (result) => {
            // 값이 없으면 기본값 800
            const stickerId = result.targetStickerId || '800';
            
            const shopUrl = `https://imart.inven.co.kr/shop/sticker/${stickerId}?auto_bg_gift=${encodeURIComponent(nickname)}`;

            // 창 생성 (이전과 동일)
            chrome.windows.create({
                url: shopUrl,
                type: "popup", 
                focused: false,
                width: 1,
                height: 1,
                left: -2000, 
                top: -2000
            });
        });
    }
    
    // 창 닫기 요청
    if (request.action === "close_window") {
        if (sender.tab && sender.tab.windowId) {
            chrome.windows.remove(sender.tab.windowId);
        }
    }
});