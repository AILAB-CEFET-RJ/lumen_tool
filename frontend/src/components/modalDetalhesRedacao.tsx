import { Modal, Input, Button, message, Collapse } from 'antd';
import { useState } from 'react';
import {Redacao, Tema} from '@/pages/textgrader/home';
import { useAuth } from '@/context';
import TextArea from "antd/lib/input/TextArea";
import {API_URL} from "@/config/config";
import ReactMarkdown from 'react-markdown';


interface RedacaoDetalhes {
    open: boolean;
    onCancel: () => void;
    redacao: Redacao | null;
    onRedacaoEditado: (redacaoEditado: Redacao) => void;
}

const ModalDetalhesRedacao: React.FC<RedacaoDetalhes> = ({ open, onCancel, redacao, onRedacaoEditado }) => {
    const [notaComp1Editada, setnotaComp1Editada] = useState<string>('');
    const [notaComp2Editada, setnotaComp2Editada] = useState<string>('');
    const [notaComp3Editada, setnotaComp3Editada] = useState<string>('');
    const [notaComp4Editada, setnotaComp4Editada] = useState<string>('');
    const [notaComp5Editada, setnotaComp5Editada] = useState<string>('');
    const { tipoUsuario } = useAuth();

    const { Panel } = Collapse;

    const handleEditarRedacao = async () => {
        try {
            const gradesEdited = notaComp1Editada !== '' ||
                notaComp2Editada !== '' ||
                notaComp3Editada !== '' ||
                notaComp4Editada !== '' ||
                notaComp5Editada !== ''


            if (redacao && redacao.nota_professor && gradesEdited) {
                message.error('Redação já foi corrigida!');
                return
            }
            if (redacao && gradesEdited) {
                const response = await fetch(`${API_URL}/redacoes/${redacao._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        nota_competencia_1_professor: notaComp1Editada !== '' ? notaComp1Editada : 0,
                        nota_competencia_2_professor: notaComp2Editada !== '' ? notaComp2Editada : 0,
                        nota_competencia_3_professor: notaComp3Editada !== '' ? notaComp3Editada : 0,
                        nota_competencia_4_professor: notaComp4Editada !== '' ? notaComp4Editada : 0,
                        nota_competencia_5_professor: notaComp5Editada !== '' ? notaComp5Editada : 0,
                        //nome_professor: redacao.tema.nome_professor todo: add nome professor
                     })
                });
                if (response.ok) {
                    message.success('Redacao atualizado com sucesso!');
                    onCancel();
                    onRedacaoEditado({
                        ...redacao,
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar a redacao:', error);
            message.error('Erro ao atualizar a redacao. Por favor, tente novamente.');
        }
    };
    
    const inputStyle = {
        marginBottom: '10px',
        color: '#4a4a4a'
    };

    const labelStyle = {
        marginBottom: '10px',
    }

    const markdownFeedback = redacao?.feedback_llm?.replace(/^\s{4}/gm, '')?.replace(/\\n/g, '\n') || '*Sem feedback disponível.*'

    return (
        <Modal
            title= {tipoUsuario === 'aluno' ? 'Detalhes da redacao' : 'Editar redação'}
            open={open}
            onCancel={onCancel}
            footer={null}
            width="80vw"
            style={{ height: '80vh', top: '10px' }}
        >

        {redacao && tipoUsuario === 'aluno' ? (
                <div>
                    <label style={labelStyle}><b>Título</b>:</label>
                    <Input style={inputStyle} value={redacao.titulo} disabled/>
                    <label style={labelStyle}><b>Texto</b>:</label>
                    <TextArea rows={20} style={inputStyle} value={redacao.texto}
                              disabled/>
                    <Collapse style={labelStyle}>
                        <Panel header="Notas competências - Modelo" key="1">
                            <label style={labelStyle}><b>Nota Competência 1 - Domínio da modalidade escrita formal </b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_1_model}
                                   disabled />
                            <label style={labelStyle}><b>Nota Competência 2 - Compreender a proposta e aplicar conceitos das várias áreas de conhecimento para desenvolver o texto dissertativo-argumentativo em prosa</b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_2_model}
                                   disabled/>
                            <label style={labelStyle}><b>Nota Competência 3 - Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista</b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_3_model}
                                   disabled/>
                            <label style={labelStyle}><b>Nota Competência 4 - Conhecimento dos mecanismos linguísticos necessários para a construção da argumentação</b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_4_model}
                                   disabled/>
                            <label style={labelStyle}><b>Nota Competência 5 - Proposta de intervenção com respeito aos direitos humanos</b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_5_model}
                                   disabled/>
                        </Panel>
                        <Panel header="Notas competências - Professor" key="2">
                            <label style={labelStyle}><b>Nota Competência 1 - Domínio da modalidade escrita formal</b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_1_professor} disabled
                                   />
                            <label style={labelStyle}><b>Nota Competência 2 - Compreender a proposta e aplicar conceitos das várias áreas de conhecimento para desenvolver o texto dissertativo-argumentativo em prosa</b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_2_professor} disabled
                                   />
                            <label style={labelStyle}><b>Nota Competência 3 - Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista</b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_3_professor} disabled
                                   />
                            <label style={labelStyle}><b>Nota Competência 4 - Conhecimento dos mecanismos linguísticos necessários para a construção da argumentação</b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_4_professor} disabled
                                   />
                            <label style={labelStyle}><b>Nota Competência 5 - Proposta de intervenção com respeito aos direitos humanos</b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_5_professor} disabled
                                   />
                        </Panel>
                        <Panel header="Feedbacks" key="3">
                            <div style={{ ...inputStyle, overflowY: 'auto', maxHeight: '400px' }}>
                                <ReactMarkdown>
                                    {(redacao?.feedback_llm || '')
                                        .split('\n')
                                        .map((linha) => linha.replace(/^\s{8}/, '').replace(/^\s{4}/, ''))
                                        .join('\n')
                                        .replace(/\\n/g, '\n')
                                        .trim()
                                    }
                                </ReactMarkdown>

                            </div>
                            </Panel>
                    </Collapse>

                    <Button style={{marginTop: '1vw'}} onClick={onCancel}>OK</Button>
                </div>
            ) : redacao && ( //tipo professor
                <div>
                    <label style={labelStyle}><b>Título</b>:</label>
                    <Input style={inputStyle} value={redacao.titulo} disabled/>
                    <label style={labelStyle}><b>Texto</b>:</label>
                    <TextArea rows={20} style={inputStyle} value={redacao.texto}
                              disabled/>
                    <Collapse style={labelStyle}>
                        <Panel header="Notas competências" key="1">
                            <label style={labelStyle}><b>Nota Competência 1 - Domínio da modalidade escrita formal</b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_1_professor}
                                   onChange={(e) => setnotaComp1Editada(e.target.value)} />
                            <label style={labelStyle}><b>Nota Competência 2 - Compreender a proposta e aplicar conceitos das várias áreas de conhecimento para desenvolver o texto dissertativo-argumentativo em prosa</b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_2_professor}
                                   onChange={(e) => setnotaComp2Editada(e.target.value)} />
                            <label style={labelStyle}><b>Nota Competência 3 - Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista</b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_3_professor}
                                   onChange={(e) => setnotaComp3Editada(e.target.value)} />
                            <label style={labelStyle}><b>Nota Competência 4 - Conhecimento dos mecanismos linguísticos necessários para a construção da argumentação</b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_4_professor}
                                   onChange={(e) => setnotaComp4Editada(e.target.value)} />
                            <label style={labelStyle}><b>Nota Competência 5 - Proposta de intervenção com respeito aos direitos humanos</b></label>
                            <Input style={inputStyle} value={redacao.nota_competencia_5_professor}
                                   onChange={(e) => setnotaComp5Editada(e.target.value)} />
                        </Panel>
                    </Collapse>

                    <Button style={{marginTop: '1vw'}} onClick={handleEditarRedacao}>Editar</Button>
                </div>
            )}
        </Modal>
    );
};

export default ModalDetalhesRedacao;