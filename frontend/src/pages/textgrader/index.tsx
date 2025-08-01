import { S } from '@/styles/Home.styles'
import Image from 'next/image'
import BookPagesImg from '../../../public/bookPages.jpg'

const Index = () => {
  return (
    <S.ContentWrapper>
        <title>TextGrader</title>
      <S.ImageContainer className='ImageContainer'>
        <Image src={BookPagesImg} alt='Páginas de livros' fill style={{ objectFit: 'cover' }} />
      </S.ImageContainer>
      <S.TextWrapper>
          <S.Title>Text Grader</S.Title>
          <S.Divider />
          <S.Description>
            A escrita é uma das formas mais poderosas de expressar ideias, defender argumentos e mostrar domínio sobre um tema. Mas avaliar milhares de textos de forma justa, rápida e consistente é um desafio — especialmente em exames de grande escala, como o ENEM no Brasil.
            Pensando nisso, o TextGrader foi criado: uma ferramenta de avaliação automatizada de redações, desenvolvida com inteligência artificial e treinada para entender as competências exigidas em textos dissertativos-argumentativos. Assim como corretores humanos, o TextGrader analisa a estrutura, a argumentação, a gramática e até a proposta de intervenção — e devolve não apenas uma nota por competência, mas também sugestões práticas para melhorar a escrita.
            Seja você estudante, professor ou gestor educacional, o TextGrader é seu aliado para tornar o processo de avaliação mais ágil, transparente e formativo.
          </S.Description>
      </S.TextWrapper>
    </S.ContentWrapper>
  )
}

export default Index;
