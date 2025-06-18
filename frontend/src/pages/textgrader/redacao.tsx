import axios from 'axios'
import { useRouter } from 'next/router';
import { useState } from 'react'
import { Modal, Skeleton } from 'antd'
import { ClearOutlined, CheckOutlined, UploadOutlined } from '@ant-design/icons'
import  TextArea from 'antd/lib/input/TextArea'
import { S } from '@/styles/Redacao.styles'
import { useAuth } from '../../context';
import {API_URL} from "@/config/config";

const Redacao = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [essay, setEssay] = useState('')
    const [essayGrade, setEssayGrade] = useState<object>({ key: 'value' })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const router = useRouter();
    const { id } = router.query;
    const { nomeUsuario } = useAuth(); 

  const showModalText = async () => {
    await getEssayGrade()
    setIsModalOpen(true)
  }

  const showModalImage = async () => {
    await uploadImage()
    setIsModalOpen(true)
  }

  const handleOk = () => {
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const handleChange = (event: any) => {
    setEssay(event.target.value)
  }


  const getEssayGrade = async () => {
    const response = await axios.post(`${API_URL}/model`, {
      essay: essay,
      id: id,
      aluno: nomeUsuario
    })

    const data = response.data
    console.log(data.grades)
   
    setEssayGrade(data.grades)
  }

  const clearEssay = () => {
    setEssay('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const uploadImage = async () => {
    if (!selectedFile) {
      console.error('No file selected')
      return
    }

    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('id', id ? id.toString() : '')
    formData.append('aluno', nomeUsuario)

    try {
      const response = await axios.post(`${API_URL}/model2`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })


      const data = response.data
      setEssayGrade(data.grades)

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <S.Wrapper>
      <S.Title>🧾 Redação 🧾</S.Title>

      <label>Ao escrever sua redação, o título deverá estar na primeira linha</label>
      <TextArea
        value={essay}
        onChange={handleChange}
        style={{ padding: 24, minHeight: 380, background: 'white', width: '100%' }}
        placeholder='Escreva sua redação aqui'
      />

      <S.ButtonWrapper>
        <S.MyButton onClick={clearEssay} size='large' type='primary' danger icon={<ClearOutlined />}>
          Apagar texto
        </S.MyButton>

        <S.MyButton onClick={showModalText} size='large' type='primary' icon={<CheckOutlined />}>
          Obter nota
        </S.MyButton>
      </S.ButtonWrapper>

      <S.UploadWrapper>
        <input type="file" onChange={handleFileChange} />
        <S.MyButton onClick={showModalImage} size='large' type='primary' icon={<UploadOutlined />}>
          Upload Imagem
        </S.MyButton>
      </S.UploadWrapper>

      <Modal title='Nota da redação' open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
        {essayGrade ? (
          Object.entries(essayGrade).map(([key, value], index) => (
            <p key={index}>{key}: <strong>{value}</strong></p>
          ))
        ) : (
          <Skeleton paragraph={{ rows: 0 }} />
        )}
      </Modal>
    </S.Wrapper>
  )
}

export default Redacao
