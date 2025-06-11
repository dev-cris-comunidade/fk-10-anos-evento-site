// public/script.js

// --- Configurações da InfinitePay ---
const INFINITEPAY_HANDLE = 'almeidascris';
// A URL base de redirecionamento para a página de sucesso da InfinitePay
// (Nota: o Typebot envia para esta URL, que então processa e redireciona para index.html)
const REDIRECT_URL_SUCCESS_BASE = 'https://eventos.fk.redenaomono.org/pagamento-concluido'; 

// --- Função para Gerar um ID Único (UUID) para o Pedido ---
// Mantida para compatibilidade, mas a InfinitePay pode gerar se não enviada.
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// --- Função Global para Iniciar o Checkout da InfinitePay ---
// Esta função é chamada PELO TYPEBOT (via Execute Code Block)
// Não é chamada diretamente por botões HTML neste projeto.
// É mantida aqui apenas para referência ou se for usada em outra parte.
function iniciarCheckoutInfinitePay(productName, precoEmCentavos, quantidade, orderNsuFromTypebot) {
    if (!productName || precoEmCentavos <= 0 || quantidade <= 0) {
        alert('Dados do produto ou quantidade inválidos para o checkout.');
        return;
    }

    // Usar orderNsu do Typebot se disponível, senão InfinitePay gera
    const orderNsu = orderNsuFromTypebot || ''; // Agora pode ser vazio ou vir do Typebot

    const items = `[{"name":"${encodeURIComponent(productName)}","price":${precoEmCentavos},"quantity":${quantidade}}]`;
    
    let infinitePayUrl = `https://checkout.infinitepay.io/${INFINITEPAY_HANDLE}?items=${items}`;
    if (orderNsu) { // Adiciona order_nsu apenas se tiver sido gerado pelo Typebot
        infinitePayUrl += `&order_nsu=${orderNsu}`;
    }
    infinitePayUrl += `&redirect_url=${encodeURIComponent(REDIRECT_URL_SUCCESS_BASE)}`;

    console.log("URL de Checkout Gerada (Pelo Typebot):", infinitePayUrl);
    // O Typebot fará o window.location.href, não este script.
}


// --- Funções para Gerenciar o Modal de Status de Pagamento ---
function showModal(title, message, isSuccess) {
    const modal = document.getElementById('payment-status-modal');
    const modalIcon = document.getElementById('modal-icon');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalCloseButton = document.getElementById('modal-close-button');

    modalTitle.innerText = title;
    modalMessage.innerText = message;

    if (isSuccess) {
        modalIcon.innerHTML = `<svg class="h-16 w-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        modalIcon.classList.remove('text-red-500');
        modalIcon.classList.add('text-green-500');
    } else {
        modalIcon.innerHTML = `<svg class="h-16 w-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        modalIcon.classList.remove('text-green-500');
        modalIcon.classList.add('text-red-500');
    }

    modal.classList.add('show');
    modal.classList.remove('hidden');

    modalCloseButton.onclick = () => {
        modal.classList.remove('show');
        modal.classList.add('hidden');
        // Limpar os parâmetros da URL após fechar o modal
        history.replaceState({}, document.title, window.location.pathname);
    };

    // Fechar modal ao clicar fora dele
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            modal.classList.add('hidden');
            history.replaceState({}, document.title, window.location.pathname);
        }
    };
}

// --- Lógica de Inicialização da Página (index.html) ---
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se há parâmetros de pagamento na URL (ao retornar de pagamento-concluido.html)
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const orderNsu = urlParams.get('order_nsu'); // Este virá da IP se ela gerou
    const transactionId = urlParams.get('transaction_id'); // Este virá da IP
    const reason = urlParams.get('reason'); // Para falhas

    if (paymentStatus) {
        let title = '';
        let message = '';
        let isSuccess = false;

        if (paymentStatus === 'success') {
            title = 'Pagamento Confirmado!';
            message = `Sua inscrição foi realizada com sucesso! ID da transação: ${transactionId || 'N/A'}. Você receberá um e-mail de confirmação em breve.`;
            isSuccess = true;
        } else {
            title = 'Erro no Pagamento';
            isSuccess = false;
            switch (reason) {
                case 'payment_not_confirmed':
                    message = `Não foi possível confirmar seu pagamento. ID da transação: ${transactionId || 'N/A'}. Por favor, verifique seu status ou entre em contato com o suporte.`;
                    break;
                case 'verification_error':
                    message = `Ocorreu um erro técnico ao verificar seu pagamento. Por favor, tente novamente ou entre em contato com o suporte.`;
                    break;
                case 'missing_params':
                    message = 'Parâmetros de pagamento ausentes na URL. Por favor, tente novamente ou entre em contato com o suporte.';
                    break;
                default:
                    message = `Seu pagamento não foi concluído com sucesso. Se o problema persistir, entre em contato.`;
            }
        }
        showModal(title, message, isSuccess);

        // Limpa os parâmetros da URL após exibir o modal para evitar reexibição em recarregamento
        // (Já feito dentro do showModal, mas manter aqui por clareza do fluxo)
        // history.replaceState({}, document.title, window.location.pathname);
    }
});

