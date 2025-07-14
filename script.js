const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');

const markdownToHTML = (text) => {
    const converter = new showdown.Converter();
    return converter.makeHtml(text);
};

const perguntarAi = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash";
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
const pergunta = `
    ## Especialidade
    Você é um assistente de meta para o jogo ${game}.

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas.

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei a resposta para isso! :(' e não tente inventar uma resposta;
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo';
    - Considere a data atual ${new Date().toLocaleDateString()};
    - Faça pesquisas atualizadas sobre o patch atual do ${game}, baseado na data atual, para dar uma resposta coerente;
    - Nunca responda itens que você não tenha certeza de que existe no patch atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres;
    - Responda em Markdown;
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está pedindo.

    ## Exemplo de resposta

    Pergunta: Qual a melhor build para o jogo ${game}
    Resposta: A melhor build para o jogo ${game} baseado no último patch é: (Coloque os exemplos logo abaixo)

    ---
    Aqui está a pergunta do usuário: ${question}
`

    const contents = [{
        role: "user",
        parts: [{
            text: pergunta,
        }],
    }];

    const tools = [{
        google_search: {},
    }];

    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents,
            tools,
        }),
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
};

const enviarFormulario = async (event) => {
    event.preventDefault();
    const apiKey = apiKeyInput.value;
    const game = gameSelect.value;
    const question = questionInput.value;

    if (apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos');
        return;
    }

    askButton.disabled = true;
    askButton.textContent = 'Aguarde enquanto perguntamos ao Gemini...';
    askButton.classList.add('loading');

    try {
        const text = await perguntarAi(question, game, apiKey);
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text);
        aiResponse.classList.remove('hidden');
    } catch (error) {
        console.log('Erro: ', error);
    } finally {
        askButton.disabled = false;
        askButton.textContent = "Perguntar";
        askButton.classList.remove('loading');
    }
};

form.addEventListener('submit', enviarFormulario);
