from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from functions import evaluate_redacao, persist_essay, get_text, get_llm_feedback
from flask_cors import CORS
import bcrypt
import os

app = Flask(__name__)
CORS(app) 

mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client.textgrader


@app.route("/")
def primeiro_endpoint_get():
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
        "nota1": float(obj.get('nota_1', 0)),
        "nota2": float(obj.get('nota_2', 0)),
        "nota3": float(obj.get('nota_3', 0)),
        "nota4": float(obj.get('nota_4', 0)),
        "nota5": float(obj.get('nota_5', 0))
    }

    feedback_llm = get_llm_feedback(essay, grades)

    essay_data = {
        "titulo": title,
        "texto": rest_of_essay.strip(),
        "nota_competencia_1_model": grades['nota1'],
        "nota_competencia_2_model": grades['nota2'],
        "nota_competencia_3_model": grades['nota3'],
        "nota_competencia_4_model": grades['nota4'],
        "nota_competencia_5_model": grades['nota5'],
        "nota_total": sum(grades.values()),
        "nota_professor": "",
        "id_tema": id_theme,
        "aluno": student,
        "feedback_llm": feedback_llm
    }



    essays_collection = db.redacoes
    essays_collection.insert_one(essay_data).inserted_id

    response = jsonify({"grades": obj})
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

    essays_collection = db.redacoes
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

    users_collection = db.users

    user_id = users_collection.insert_one({
        "email": user_data['email'],
        "password": hashed_password,
        "username": user_data['nomeUsuario'],
        "tipoUsuario": user_data.get('tipoUsuario', 'usuario')
    }).inserted_id

    return jsonify({"message": "Usuário criado com sucesso", "user_id": str(user_id)}), 201


@app.post("/userLogin")
def login():
    user_data = request.json

    if 'email' not in user_data or 'password' not in user_data:
        return jsonify({"error": "Dados insuficientes"}), 400

    users_collection = db.users
    user = users_collection.find_one({"email": user_data['email']})

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
    users_collection = db.users
    alunos = list(users_collection.find({"tipoUsuario": "aluno"}))

    for aluno in alunos:
        aluno['_id'] = str(aluno['_id'])  # Convertendo ObjectId para string
        aluno.pop('password', None)  # Remove o campo 'password' para evitar problemas com bytes

    response = jsonify(alunos)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@app.get("/temas")
def get_temas():
    temas_collection = db.temas
    temas = list(temas_collection.find())
    for tema in temas:
        tema['_id'] = str(tema['_id'])
    return jsonify(temas)


@app.post("/temas")
def create_tema():
    tema_data = request.json
    if 'nome_professor' not in tema_data or 'tema' not in tema_data or 'descricao' not in tema_data:
        return jsonify({"error": "Dados insuficientes"}), 400

    temas_collection = db.temas
    tema_id = temas_collection.insert_one(tema_data).inserted_id
    return jsonify({"message": "Tema criado com sucesso", "tema_id": str(tema_id)}), 201


@app.put("/temas/<id>")
def update_tema(id):
    temas_collection = db.temas

    try:
        object_id = ObjectId(id)
        data = request.json

        result = temas_collection.update_one(
            {"_id": object_id},
            {"$set": {
                "tema": data.get("tema"),
                "descricao": data.get("descricao"),
                "nome_professor": data.get("nome_professor")
            }}
        )

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
    temas_collection = db.temas
    try:
        object_id = ObjectId(id)
        result = temas_collection.delete_one({"_id": object_id})  #

        if result.deleted_count == 1:
            return jsonify({"message": "Tema deletado com sucesso!"}), 200
        else:
            return jsonify({"error": "Tema não encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/redacoes")
def get_redacoes():
    user_name = request.args.get("user")
    redacoes_collection = db.redacoes
    if user_name is not None:
        redacoes = list(redacoes_collection.find({"aluno": user_name}))
    else:
        redacoes = list(redacoes_collection.find())
    for redacao in redacoes:
        redacao['_id'] = str(redacao['_id'])
    return jsonify(redacoes)


@app.post("/redacoes")
def create_redacao():
    redacao_data = request.json
    if 'titulo_redacao' not in redacao_data or 'id_tema' not in redacao_data:
        return jsonify({"error": "Dados insuficientes"}), 400

    redacoes_collection = db.redacoes
    redacao_id = redacoes_collection.insert_one(redacao_data).inserted_id
    return jsonify({"message": "Redação criada com sucesso", "redacao_id": str(redacao_id)}), 201


@app.get("/redacoes/<id>")
def get_redacao_by_id(id):
    redacoes_collection = db.redacoes
    redacao = redacoes_collection.find_one({"_id": ObjectId(id)})
    redacao['_id'] = str(redacao['_id'])
    return jsonify(redacao)


@app.put("/redacoes/<id>")
def update_redacao(id):
    redacoes_collection = db.redacoes

    try:
        object_id = ObjectId(id)
        data = request.json

        result = redacoes_collection.update_one(
            {"_id": object_id},
            {"$set": {
                "nome_professor": data.get("nome_professor"),
                "nota_competencia_1_professor": data.get("nota_competencia_1_professor"),
                "nota_competencia_2_professor": data.get("nota_competencia_2_professor"),
                "nota_competencia_3_professor": data.get("nota_competencia_3_professor"),
                "nota_competencia_4_professor": data.get("nota_competencia_4_professor"),
                "nota_competencia_5_professor": data.get("nota_competencia_5_professor"),
                "nota_professor": float(data.get("nota_competencia_1_professor")) + float(data.get(
                    "nota_competencia_2_professor")) + float(data.get("nota_competencia_3_professor")) + float(data.get(
                    "nota_competencia_4_professor")) + float(data.get("nota_competencia_5_professor")),
            }}
        )

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