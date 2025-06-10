// public/script.js

// --- Configurações da InfinitePay ---
const INFINITEPAY_HANDLE = 'almeidascris';
const REDIRECT_URL_SUCCESS = 'https://fk.redenaomono.org/pagamento-concluido';

// --- Função para Gerar um ID Único (UUID) para o Pedido ---
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// --- Função Global para Iniciar o Checkout da InfinitePay ---
// Esta função é chamada pelas páginas de checkout (member-checkout.html e public-checkout.html)
// Ela recebe o nome do produto, o preço em centavos e a quantidade.
function iniciarCheckoutInfinitePay(productName, precoEmCentavos, quantidade) {
    if (!productName || precoEmCentavos <= 0 || quantidade <= 0) {
        alert('Dados do produto ou quantidade inválidos para o checkout.');
        return;
    }

    const orderNsu = generateUUID();
    const items = `[{"name":"${encodeURIComponent(productName)}","price":${precoEmCentavos},"quantity":${quantidade}}]`;
    let infinitePayUrl = `https://checkout.infinitepay.io/${INFINITEPAY_HANDLE}?items=${items}&order_nsu=${orderNsu}&redirect_url=${encodeURIComponent(REDIRECT_URL_SUCCESS)}`;

    console.log("URL de Checkout Gerada:", infinitePayPayUrl); // Corrigido PayURL para PayUrl
    window.location.href = infinitePayUrl;
}

// --- Lógica de Inicialização da Página ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página carregada. A seção de checkout com Typebot deve estar visível.');
    // Não há botões para escutar o clique aqui, pois o Typebot gerencia o fluxo de compra.
});
