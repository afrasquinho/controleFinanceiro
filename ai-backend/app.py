from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Função de análise financeira (exemplo simplificado)
def analyze_finances(gastos_data, rendimentos_data):
    total_gastos = sum(gasto['valor'] for gasto in gastos_data)
    total_rendimentos = sum(rendimento['valor'] for rendimento in rendimentos_data)

    # Exemplo de análise
    return {
        "total_gastos": total_gastos,
        "total_rendimentos": total_rendimentos,
        "saldo": total_rendimentos - total_gastos,
        "recomendacoes": [
            "Considere reduzir gastos com alimentação.",
            "Aumente sua renda com trabalhos extras."
        ]
    }

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    gastos_data = data.get('gastosData', [])
    rendimentos_data = data.get('rendimentosData', [])
    
    analysis_result = analyze_finances(gastos_data, rendimentos_data)
    return jsonify(analysis_result)

if __name__ == '__main__':
    app.run(debug=True)
