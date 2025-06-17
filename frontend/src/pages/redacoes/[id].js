// pages/redacoes/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function RedacaoPage() {
  const router = useRouter();
  const { id } = router.query; // Obter o ID da URL

  const [redacao, setRedacao] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Buscar a redação pelo ID usando o endpoint de API
      fetch(`/api/redacoes/${id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Redação não encontrada");
          }
          return response.json();
        })
        .then((data) => {
          setRedacao(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error.message);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <p>Carregando...</p>;

  if (!redacao) return <p>Redação não encontrada.</p>;

  return (
    <div>
      <h1>{redacao.titulo}</h1>
      <p>{redacao.conteudo}</p>
    </div>
  );
}
