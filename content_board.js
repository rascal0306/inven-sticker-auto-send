window.addEventListener('load', addGiftButtons);

const observer = new MutationObserver(() => addGiftButtons());
observer.observe(document.body, { childList: true, subtree: true });

function addGiftButtons() {
    // 사용할 선택자들을 변수로 정의
    const selectorStr = '[onclick*="layerNickName"], .layerNickName, .writer, .nick, .nickname';
    const targets = document.querySelectorAll(selectorStr);

    targets.forEach((el) => {
        // 1. 이미 버튼이 옆에 있으면 생성하지 않음
        if (el.nextElementSibling && el.nextElementSibling.classList.contains('auto-gift-btn')) return;

        // [중복 방지 핵심 로직]
        // 현재 요소(el) 안쪽에 또 다른 타겟(selectorStr)이 들어있다면?
        // -> 현재 요소는 '겉포장'일 뿐이므로 건너뜁니다. (안쪽 요소가 처리할 것임)
        if (el.querySelector(selectorStr)) return;

        // 이미지 태그 자체에는 붙이지 않음 (레벨 아이콘 등)
        if (el.tagName === 'IMG') return;

        // 닉네임 추출 로직
        let targetNick = '';
        
        // onclick에서 추출 시도
        const onclickAttr = el.getAttribute('onclick');
        if (onclickAttr) {
            const match = onclickAttr.match(/layerNickName\s*\(\s*'([^']+)'/); 
            if (match) targetNick = match[1];
        }
        
        // 없으면 텍스트에서 추출
        if (!targetNick) {
            targetNick = el.innerText.trim();
        }

        // 유효성 검사 (너무 길거나 없으면 패스)
        if (!targetNick || targetNick.length > 20) return;

        // 버튼 생성
        const btn = document.createElement('span');
        btn.innerText = '🎁';
        btn.className = 'auto-gift-btn';
        btn.style.cursor = 'pointer';
        btn.style.marginLeft = '4px'; // 간격 살짝 조정
        btn.style.fontSize = '12px'; 
        btn.style.display = 'inline-block';
        btn.style.zIndex = '999';
        btn.title = `'${targetNick}' 님에게 스티커 선물하기`;

        // 클릭 이벤트
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            chrome.storage.local.get(['targetStickerId'], (result) => {
                const stickerId = result.targetStickerId || '800';
                if (confirm(`'${targetNick}' 님에게 [${stickerId}번] 스티커를 선물하시겠습니까?`)) {
                    chrome.runtime.sendMessage({
                        action: "start_gift_process",
                        nickname: targetNick
                    });
                }
            });
        });

        // 요소 바로 뒤에 버튼 부착
        if (el.parentNode) {
            el.parentNode.insertBefore(btn, el.nextSibling);
        }
    });
}