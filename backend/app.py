import database
from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from functions import evaluate_redacao, persist_essay, get_text
from llm import get_llm_feedback
from flask_cors import CORS
import bcrypt
import os

app = Flask(__name__)
CORS(app) 


competencias = {
    "comp1":"Domínio da modalidade escrita formal",
    "comp2":"Compreender a proposta e aplicar conceitos das várias áreas de conhecimento para desenvolver o texto dissertativo-argumentativo em prosa",
    "comp3":"Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista",
    "comp4":"Conhecimento dos mecanismos linguísticos necessários para a construção da argumentação",
    "comp5":"Proposta de intervenção com respeito aos direitos humanos",
}


@app.route("/")
def health():
    return ("OK!", 200)


@app.post("/model")
def post_model_response():
    essay = request.json['essay']
    id_theme = request.json['id']
    student = request.json['aluno']

    lines = essay.split('\n')
    title = lines[0] if lines else "Título não fornecido"

    rest_of_essay = '\n'.join(line for line in lines[1:] if line.strip())

    obj = evaluate_redacao(essay)

    grades = {
        competencias["comp1"]: float(obj.get('nota_1', 0)),
        competencias["comp2"]: float(obj.get('nota_2', 0)),
        competencias["comp3"]: float(obj.get('nota_3', 0)),
        competencias["comp4"]: float(obj.get('nota_4', 0)),
        competencias["comp5"]: float(obj.get('nota_5', 0))
    }

    theme = database.get_tema(id_theme)
    feedback_llm = get_llm_feedback(essay, grades, theme)

    essay_data = {
        "titulo": title,
        "texto": rest_of_essay.strip(),
        "nota_competencia_1_model": grades[competencias["comp1"]],
        "nota_competencia_2_model": grades[competencias["comp2"]],
        "nota_competencia_3_model": grades[competencias["comp3"]],
        "nota_competencia_4_model": grades[competencias["comp4"]],
        "nota_competencia_5_model": grades[competencias["comp5"]],
        "nota_total": sum(grades.values()),
        "nota_professor": "",
        "id_tema": id_theme,
        "aluno": student,
        "feedback_llm": feedback_llm,
        "competencias": competencias
    }



    essays_collection = database.db.redacoes
    essays_collection.insert_one(essay_data).inserted_id

    response = jsonify({"grades": grades})
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@app.post("/model_ocr")
def post_model_response_witht_ocr():
    print("model_ocr")
    image = request.files['image']
    print('imagem', image)
    id_theme = request.form.get('id')
    student = request.form.get('aluno')

    essay = get_text(image)

    obj = evaluate_redacao(essay)

    grades = {
        "nota1": float(obj.get('nota_1', 0)),
        "nota2": float(obj.get('nota_2', 0)),
        "nota3": float(obj.get('nota_3', 0)),
        "nota4": float(obj.get('nota_4', 0)),
        "nota5": float(obj.get('nota_5', 0))
    }

    feedback_llm = get_llm_feedback(essay, grades)

    essay_data = {
        "titulo": "Redação de imagem",
        "texto": essay,
        "nota_competencia_1_model": grades['nota1'],
        "nota_competencia_2_model": grades['nota2'],
        "nota_competencia_3_model": grades['nota3'],
        "nota_competencia_4_model": grades['nota4'],
        "nota_competencia_5_model": grades['nota5'],
        "nota_total": sum(grades.values()),
        "id_tema": id_theme,
        "aluno": student,
        "feedback_llm": feedback_llm,
    }

    essays_collection = database.db.redacoes
    essays_collection.insert_one(essay_data).inserted_id

    response = jsonify({"grades": obj})
    response.headers.add('Access-Control-Allow-Origin', '*')

    persist_essay(essay, obj)
    return response


@app.post("/userRegister")
def create_user():
    user_data = request.json

    if 'email' not in user_data or 'password' not in user_data or 'nomeUsuario' not in user_data:
        return jsonify({"error": "Dados insuficientes"}), 400

    hashed_password = bcrypt.hashpw(user_data['password'].encode('utf-8'), bcrypt.gensalt())

    database.insert_user(user_data, hashed_password)

    return jsonify({"message": "Usuário criado com sucesso"}), 201


@app.post("/userLogin")
def login():
    user_data = request.json

    if 'email' not in user_data or 'password' not in user_data:
        return jsonify({"error": "Dados insuficientes"}), 400

    user = database.login(user_data)

    if user:
        if bcrypt.checkpw(user_data['password'].encode('utf-8'), user['password']):
            return jsonify({
                "tipoUsuario": user.get('tipoUsuario', 'usuario'),
                "nomeUsuario": user.get('username')
            }), 200
        else:
            return jsonify({"error": "Email ou senha incorretos"}), 401

    return jsonify({"error": "Usuário não encontrado"}), 404


@app.get("/users/alunos")
def get_alunos():
    alunos = database.get_alunos()
    response = jsonify(alunos)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@app.get("/temas")
def get_temas():
    temas = database.get_temas()
    return jsonify(temas)


@app.post("/temas")
def create_tema():
    tema_data = request.json
    if 'nome_professor' not in tema_data or 'tema' not in tema_data or 'descricao' not in tema_data:
        return jsonify({"error": "Dados insuficientes"}), 400

    database.create_tema(tema_data)
    return jsonify({"message": "Tema criado com sucesso"}), 201


@app.put("/temas/<id>")
def update_tema(id):
    try:
        object_id = ObjectId(id)
        data = request.json

        result = database.update_tema(object_id, data)

        if result.matched_count == 1:
            if result.modified_count == 1:
                return jsonify({"message": "Tema atualizado com sucesso!"}), 200
            else:
                return jsonify({"message": "Nada foi atualizado."}), 304
        else:
            return jsonify({"error": "Tema não encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.delete("/temas/<id>")
def delete_tema(id):
    try:
        object_id = ObjectId(id)
        result = database.delete_tema(object_id)

        if result.deleted_count == 1:
            return jsonify({"message": "Tema deletado com sucesso!"}), 200
        else:
            return jsonify({"error": "Tema não encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/redacoes")
def get_redacoes():
    user_name = request.args.get("user")
    redacoes = database.get_redacoes(user_name)
    return jsonify(redacoes)


@app.post("/redacoes")
def create_redacao():
    redacao_data = request.json
    if 'titulo_redacao' not in redacao_data or 'id_tema' not in redacao_data:
        return jsonify({"error": "Dados insuficientes"}), 400

    database.create_redacoes(redacao_data)
    return jsonify({"message": "Redação criada com sucesso"}), 201


@app.get("/redacoes/<id>")
def get_redacao_by_id(id):
    redacao = database.get_redacao_by_id(id)
    return jsonify(redacao)


@app.put("/redacoes/<id>")
def update_redacao(id):
    try:
        data = request.json
        result = database.update_redacao(id, data)

        if result.matched_count == 1:
            if result.modified_count == 1:
                return jsonify({"message": "Redacao atualizado com sucesso!"}), 200
            else:
                return jsonify({"message": "Nada foi atualizado."}), 304
        else:
            return jsonify({"error": "Tema não encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
  from support import use_vectorizer
  debug = True # com essa opção como True, ao salvar, o "site" recarrega automaticamente.
  app.run(host='0.0.0.0', port=5000, debug=debug)