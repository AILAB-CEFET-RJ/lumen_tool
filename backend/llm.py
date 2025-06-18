import ollama
import json

ollama_client = ollama.Client(host='http://ollama:11434')

def get_system_prompt(competencias_str):
    return (
        "Você é um avaliador pedagógico especialista em produção textual no contexto do ENEM. "
        "Sua tarefa é analisar uma redação escrita por um estudante, considerando as notas atribuídas "
        "a cada uma das cinco competências avaliativas do exame e também o tema (i.e., a proposta) da redação correspondente.\n\n"
        "Você deve gerar sugestões específicas de melhoria para o texto, sempre levando em conta:\n"
        "- O conteúdo integral da redação produzida.\n"
        "- As notas atribuídas em cada uma das cinco competências (0–200).\n"
        "- O tema da redação (proposta e/ou texto motivador).\n\n"
        f"**Competências Avaliadas:**\n{competencias_str}\n\n"
        "Apresente sua resposta no seguinte formato:\n\n"
        "**Sugestões de Melhoria (uma por competência):**\n"
        "1. **Competência [V]** (Nota: [nota]): [Sugestão concisa]\n"
        "2. **Competência [W]** (Nota: [nota]): [Sugestão concisa]\n"
        "3. **Competência [XX]** (Nota: [nota]): [Sugestão concisa]\n"
        "4. **Competência [Y]** (Nota: [nota]): [Sugestão concisa]\n"
        "5. **Competência [Z]** (Nota: [nota]): [Sugestão concisa]\n\n"
        "Guie-se pelas notas fornecidas e pelo conteúdo do texto para cada sugestão."
        "[Para cada competência, gere até 3 sugestões focadas nessa competência, levando em conta o conteúdo da redação, o escopo do tema e a nota recebida]\n"
        "---\n\n"
        "Importante: Use o tema da redação para avaliar a pertinência temática e o foco argumentativo do estudante. "
        "Se a proposta de intervenção for vaga, sugira maneiras de conectá-la melhor ao problema central. "
        "Não reescreva a redação nem emita julgamentos genéricos; concentre-se em orientar melhorias concretas."
    )

def get_user_prompt(tema, texto, competencias_str_user):
    return (
        f"Tema da redação:\n{tema}\n\n"
        f"Texto da redação:\n{texto}\n\n"
        f"Notas por competência:\n{competencias_str_user}"
    )

def get_llm_feedback(essay, grades, theme) -> str:
    competencias_str = "\n".join([
        f"- **{k}**: Nota {v}"
        for k, v in grades.items()
    ])

    # Monta o system prompt
    system_prompt = get_system_prompt(competencias_str)

    # Monta o user prompt
    competencias_str_user = "\n".join([
        f"Competência: Nota {v} | {k}"
        for k, v in grades.items()
    ])

    user_prompt = get_user_prompt(theme, essay, competencias_str_user)

    # Chamada ao modelo via Ollama
    response = ollama_client.chat(
        model="gemma:7b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )

    return response["message"]["content"]
    
