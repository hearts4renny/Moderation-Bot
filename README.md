# 🛡️ Sistema Integrado de Moderação & Suporte

Olá! 👋 Este é um dos meus projetos liberado ao público, desenvolvido com foco em fazer as comunidades mais seguras e organizadas no Discord. Esta é uma ferramenta que visa a experiência tanto dos moderadores quanto dos membros.

---

### 🔨 1. Moderação Inteligente
Não se trata apenas de banir. O sistema avisa o usuário por mensagem privada (DM) sobre o motivo da punição antes de executá-la, mantendo transparência.
* **Comandos:** `/mod kick`, `/mod ban` e `/mod timeout`.
* **Diferencial:** O bot respeita a hierarquia do servidor, impedindo erros administrativos.

### 📝 2. Sistema de Advertências (Warns)
Nada de esquecer quem causou problemas. Com a integração ao **MongoDB**, cada advertência fica gravada para sempre.
* **Comandos:** `/warn add` e `/warn list`.
* **Diferencial:** Um histórico limpo e fácil de ler para que a equipe de moderação tome decisões baseadas em fatos.

### 🎫 3. Atendimento (Tickets)
Chega de suporte bagunçado em canais abertos ou DMs. 
* **Como funciona:** O utilizador clica num botão e um canal privado é criado na hora.
* **Diferencial:** O sistema impede que vários tickets seja abertos ao mesmo tempo pelo mesmo usuário, mantendo o servidor limpo e organizado.

---

## 🛠️ Tecnologias

Aqui está o que usei para dar vida a este projeto:

* **Node.js & Discord.js:** A base sólida para um bot moderno.
* **MongoDB:** Para que nenhum dado se perca, mesmo que o bot reinicie.
* **Dotenv:** Segurança em primeiro lugar, mantendo chaves sensíveis protegidas.
* **Arquitetura Limpa:** Código organizado em módulos, facilitando futuras atualizações.

---

## 🚀 Como testar este projeto?

1.  **Clone o código:** `git clone https://github.com/hearts4skypurr/Moderation-Bot.git`
2.  **Instale tudo:** `npm install`
3.  **Configure:** Renomeie o `.env.example` para `.env` e coloque as suas chaves.
4.  **Ligue o bot:** `node index.js`

---

## ⚠️ Termos de Uso e Copyright

Este projeto foi desenvolvido por **Lynn** exclusivamente para fins de portfólio e demonstração técnica.

* **Uso Pessoal:** Sinta-se à vontade para estudar o código e utilizá-lo como base para o seu próprio aprendizado.
* **Proibição de Venda:** É proibida a comercialização, revenda ou distribuição deste código (ou partes dele) como um produto pago sem autorização prévia.
* **Plágio:** A cópia integral deste repositório para submissão em candidaturas de terceiros ou portfólios alheios não é permitida.

Ao utilizar este código, você concorda em manter os créditos originais ao autor.

---

Desenvolvido com ☕ e 💻 por **Lynn**.