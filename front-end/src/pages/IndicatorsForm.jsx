import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOperatorById, createIndicators, generateFeedback, getIndicatorsFromSheet } from '../services/api';
import './IndicatorsForm.css';

function IndicatorsForm() {
  const { operatorId } = useParams();
  const navigate = useNavigate();
  const [operator, setOperator] = useState(null);
  const [formData, setFormData] = useState({
    // Campos principais
    calls: '',
    tma: '',
    qualityScore: '',
    absenteeism: '',
    // Campos adicionais da planilha
    qtdPesqTelefone: '',
    tickets: '',
    tmt: '',
    pesquisaTicket: '',
    qtdPesqTicket: '',
    totalEscalado: '',
    totalLogado: '',
    percentLogado: '',
    pausaEscalada: '',
    totalPausas: '',
    percentPausas: '',
    almocoEscalado: '',
    almocoRealizado: '',
    percentAlmoco: '',
    pausa10Escalada: '',
    pausa10Realizado: '',
    percentPausa10: '',
    pausaBanheiro: '',
    percentPausaBanheiro: '',
    pausaFeedback: '',
    percentPausaFeedback: '',
    treinamento: '',
    percentTreinamento: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loadingFromSheet, setLoadingFromSheet] = useState(false);
  const [sheetMonth, setSheetMonth] = useState('OUT'); // OUT, NOV, DEZ

  useEffect(() => {
    loadOperator();
  }, [operatorId]);

  const loadOperator = async () => {
    try {
      const response = await getOperatorById(operatorId);
      setOperator(response.data);
    } catch (error) {
      console.error('Erro ao carregar operador:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createIndicators({
        operatorId: parseInt(operatorId),
        ...formData,
      });
      alert('Indicadores cadastrados com sucesso!');
      setFormData({
        calls: '',
        tma: '',
        qualityScore: '',
        absenteeism: '',
        qtdPesqTelefone: '',
        tickets: '',
        tmt: '',
        pesquisaTicket: '',
        qtdPesqTicket: '',
        totalEscalado: '',
        totalLogado: '',
        percentLogado: '',
        pausaEscalada: '',
        totalPausas: '',
        percentPausas: '',
        almocoEscalado: '',
        almocoRealizado: '',
        percentAlmoco: '',
        pausa10Escalada: '',
        pausa10Realizado: '',
        percentPausa10: '',
        pausaBanheiro: '',
        percentPausaBanheiro: '',
        pausaFeedback: '',
        percentPausaFeedback: '',
        treinamento: '',
        percentTreinamento: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao cadastrar indicadores');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFromSheet = async () => {
    if (!operator) {
      setError('Operador não carregado');
      return;
    }

    setLoadingFromSheet(true);
    setError(null);

    try {
      const response = await getIndicatorsFromSheet(sheetMonth, operator.name);
      const indicators = response.data;
      
      // Preencher o formulário com os dados da planilha
      const additionalData = indicators.additionalData || {};
      setFormData({
        // Campos principais
        calls: indicators.calls || '',
        tma: indicators.tma || '',
        qualityScore: indicators.qualityScore || '',
        absenteeism: indicators.absenteeism || '',
        // Campos adicionais
        qtdPesqTelefone: additionalData.qtdPesqTelefone || '',
        tickets: additionalData.tickets || '',
        tmt: additionalData.tmt || '',
        pesquisaTicket: additionalData.pesquisaTicket || '',
        qtdPesqTicket: additionalData.qtdPesqTicket || '',
        totalEscalado: additionalData.totalEscalado || '',
        totalLogado: additionalData.totalLogado || '',
        percentLogado: additionalData.percentLogado || '',
        pausaEscalada: additionalData.pausaEscalada || '',
        totalPausas: additionalData.totalPausas || '',
        percentPausas: additionalData.percentPausas || '',
        almocoEscalado: additionalData.almocoEscalado || '',
        almocoRealizado: additionalData.almocoRealizado || '',
        percentAlmoco: additionalData.percentAlmoco || '',
        pausa10Escalada: additionalData.pausa10Escalada || '',
        pausa10Realizado: additionalData.pausa10Realizado || '',
        percentPausa10: additionalData.percentPausa10 || '',
        pausaBanheiro: additionalData.pausaBanheiro || '',
        percentPausaBanheiro: additionalData.percentPausaBanheiro || '',
        pausaFeedback: additionalData.pausaFeedback || '',
        percentPausaFeedback: additionalData.percentPausaFeedback || '',
        treinamento: additionalData.treinamento || '',
        percentTreinamento: additionalData.percentTreinamento || '',
      });
      
      alert('Dados carregados da planilha com sucesso!');
    } catch (err) {
      console.error('Erro ao carregar dados da planilha:', err);
      console.error('Resposta do servidor:', err.response?.data);
      
      let errorMessage = 'Erro ao carregar dados da planilha.';
      
      if (err.response?.data) {
        // Priorizar details, depois error
        errorMessage = err.response.data.details || err.response.data.error || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Adicionar informações úteis
      if (!errorMessage.includes('Credenciais') && !errorMessage.includes('permissão')) {
        errorMessage += ' Verifique: 1) Se as credenciais do Google estão configuradas no .env, 2) Se a planilha foi compartilhada com a Service Account, 3) Se o operador existe na aba selecionada.';
      }
      
      setError(errorMessage);
    } finally {
      setLoadingFromSheet(false);
    }
  };

  const handleGenerateFeedback = async () => {
    setGenerating(true);
    setError(null);

    try {
      await generateFeedback(parseInt(operatorId));
      alert('Feedback gerado com sucesso!');
      navigate(`/feedback/${operatorId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao gerar feedback');
    } finally {
      setGenerating(false);
    }
  };

  if (!operator) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="indicators-form">
      <div className="page-header">
        <h1>Inserir Indicadores</h1>
        <p><strong>Operador:</strong> {operator.name} | <strong>Mês:</strong> {operator.reference_month}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="sheet-integration-section">
        <h2>📊 Buscar da Planilha do Google Sheets</h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Selecione o mês e clique no botão para buscar os dados automaticamente da planilha.
        </p>
        <div className="sheet-controls">
          <label htmlFor="sheetMonth">Mês da Planilha:</label>
          <select
            id="sheetMonth"
            value={sheetMonth}
            onChange={(e) => setSheetMonth(e.target.value)}
            className="sheet-select"
          >
            <option value="OUT">Outubro (OUT)</option>
            <option value="NOV">Novembro (NOV)</option>
            <option value="DEZ">Dezembro (DEZ)</option>
          </select>
          <button
            type="button"
            onClick={handleLoadFromSheet}
            className="btn btn-sheet"
            disabled={loadingFromSheet || !operator}
          >
            {loadingFromSheet ? 'Carregando...' : '📥 Buscar da Planilha'}
          </button>
        </div>
        <p className="sheet-info">
          Os dados serão buscados automaticamente da planilha do Google Sheets e preenchidos nos campos abaixo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="calls">Ligações Realizadas</label>
          <input
            type="number"
            id="calls"
            name="calls"
            value={formData.calls}
            onChange={handleChange}
            placeholder="Ex: 150"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tma">TMA (Tempo Médio de Atendimento)</label>
          <input
            type="text"
            id="tma"
            name="tma"
            value={formData.tma}
            onChange={handleChange}
            placeholder="Ex: 00:05:30"
            pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
          />
        </div>

        <div className="form-group">
          <label htmlFor="qualityScore">Pesquisa Telefone (0,00)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            id="qualityScore"
            name="qualityScore"
            value={formData.qualityScore}
            onChange={handleChange}
            placeholder="Ex: 8,50"
          />
        </div>

        <div className="form-group">
          <label htmlFor="absenteeism">Taxa de Absenteísmo (%)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            id="absenteeism"
            name="absenteeism"
            value={formData.absenteeism}
            onChange={handleChange}
            placeholder="Ex: 2.5"
          />
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#2c3e50' }}>Dados Adicionais da Planilha</h3>

        <div className="form-group">
          <label htmlFor="qtdPesqTelefone">Qtd Pesquisa Telefone</label>
          <input
            type="number"
            id="qtdPesqTelefone"
            name="qtdPesqTelefone"
            value={formData.qtdPesqTelefone}
            onChange={handleChange}
            placeholder="Ex: 50"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tickets"># Tickets</label>
          <input
            type="number"
            id="tickets"
            name="tickets"
            value={formData.tickets}
            onChange={handleChange}
            placeholder="Ex: 120"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tmt">TMT</label>
          <input
            type="text"
            id="tmt"
            name="tmt"
            value={formData.tmt}
            onChange={handleChange}
            placeholder="Ex: 00:03:30 ou texto"
          />
        </div>

        <div className="form-group">
          <label htmlFor="pesquisaTicket">Pesquisa Ticket (0,00)</label>
          <input
            type="number"
            step="0.01"
            id="pesquisaTicket"
            name="pesquisaTicket"
            value={formData.pesquisaTicket}
            onChange={handleChange}
            placeholder="Ex: 9,00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="qtdPesqTicket">Qtd Pesquisa Ticket</label>
          <input
            type="number"
            id="qtdPesqTicket"
            name="qtdPesqTicket"
            value={formData.qtdPesqTicket}
            onChange={handleChange}
            placeholder="Ex: 45"
          />
        </div>

        <div className="form-group">
          <label htmlFor="totalEscalado">Total Escalado</label>
          <input
            type="text"
            id="totalEscalado"
            name="totalEscalado"
            value={formData.totalEscalado}
            onChange={handleChange}
            placeholder="Ex: 160:00:00"
            pattern="[0-9]{2,3}:[0-9]{2}:[0-9]{2}"
          />
        </div>

        <div className="form-group">
          <label htmlFor="totalLogado">Total Logado</label>
          <input
            type="text"
            id="totalLogado"
            name="totalLogado"
            value={formData.totalLogado}
            onChange={handleChange}
            placeholder="Ex: 155:30:00"
            pattern="[0-9]{2,3}:[0-9]{2}:[0-9]{2}"
          />
        </div>

        <div className="form-group">
          <label htmlFor="percentLogado">% Logado</label>
          <input
            type="text"
            id="percentLogado"
            name="percentLogado"
            value={formData.percentLogado}
            onChange={handleChange}
            placeholder="Ex: 97.2%"
          />
        </div>

        <div className="form-group">
          <label htmlFor="pausaEscalada">Pausa Escalada</label>
          <input
            type="text"
            id="pausaEscalada"
            name="pausaEscalada"
            value={formData.pausaEscalada}
            onChange={handleChange}
            placeholder="Ex: 02:00:00"
            pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
          />
        </div>

        <div className="form-group">
          <label htmlFor="totalPausas">Total de Pausas</label>
          <input
            type="text"
            id="totalPausas"
            name="totalPausas"
            value={formData.totalPausas}
            onChange={handleChange}
            placeholder="Ex: 02:30:00"
            pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
          />
        </div>

        <div className="form-group">
          <label htmlFor="percentPausas">% Pausas</label>
          <input
            type="text"
            id="percentPausas"
            name="percentPausas"
            value={formData.percentPausas}
            onChange={handleChange}
            placeholder="Ex: 1.25%"
          />
        </div>

        <div className="form-group">
          <label htmlFor="almocoEscalado">Almoço Escalado</label>
          <input
            type="text"
            id="almocoEscalado"
            name="almocoEscalado"
            value={formData.almocoEscalado}
            onChange={handleChange}
            placeholder="Ex: 01:00:00"
            pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
          />
        </div>

        <div className="form-group">
          <label htmlFor="almocoRealizado">Almoço Realizado</label>
          <input
            type="text"
            id="almocoRealizado"
            name="almocoRealizado"
            value={formData.almocoRealizado}
            onChange={handleChange}
            placeholder="Ex: 01:00:00"
            pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
          />
        </div>

        <div className="form-group">
          <label htmlFor="percentAlmoco">% Almoço</label>
          <input
            type="text"
            id="percentAlmoco"
            name="percentAlmoco"
            value={formData.percentAlmoco}
            onChange={handleChange}
            placeholder="Ex: 100.0%"
          />
        </div>

        <div className="form-group">
          <label htmlFor="pausa10Escalada">Pausa 10 Escalada</label>
          <input
            type="text"
            id="pausa10Escalada"
            name="pausa10Escalada"
            value={formData.pausa10Escalada}
            onChange={handleChange}
            placeholder="Ex: 00:20:00"
            pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
          />
        </div>

        <div className="form-group">
          <label htmlFor="pausa10Realizado">Pausa 10 Realizado</label>
          <input
            type="text"
            id="pausa10Realizado"
            name="pausa10Realizado"
            value={formData.pausa10Realizado}
            onChange={handleChange}
            placeholder="Ex: 00:20:00"
            pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
          />
        </div>

        <div className="form-group">
          <label htmlFor="percentPausa10">% Pausa 10</label>
          <input
            type="text"
            id="percentPausa10"
            name="percentPausa10"
            value={formData.percentPausa10}
            onChange={handleChange}
            placeholder="Ex: 100.0%"
          />
        </div>

        <div className="form-group">
          <label htmlFor="pausaBanheiro">Pausa Banheiro</label>
          <input
            type="text"
            id="pausaBanheiro"
            name="pausaBanheiro"
            value={formData.pausaBanheiro}
            onChange={handleChange}
            placeholder="Ex: 00:30:00"
            pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
          />
        </div>

        <div className="form-group">
          <label htmlFor="percentPausaBanheiro">% Pausa Banheiro</label>
          <input
            type="text"
            id="percentPausaBanheiro"
            name="percentPausaBanheiro"
            value={formData.percentPausaBanheiro}
            onChange={handleChange}
            placeholder="Ex: 0.31%"
          />
        </div>

        <div className="form-group">
          <label htmlFor="pausaFeedback">Pausa Feedback</label>
          <input
            type="text"
            id="pausaFeedback"
            name="pausaFeedback"
            value={formData.pausaFeedback}
            onChange={handleChange}
            placeholder="Ex: 00:00:00"
            pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
          />
        </div>

        <div className="form-group">
          <label htmlFor="percentPausaFeedback">% Pausa Feedback</label>
          <input
            type="text"
            id="percentPausaFeedback"
            name="percentPausaFeedback"
            value={formData.percentPausaFeedback}
            onChange={handleChange}
            placeholder="Ex: 0.0%"
          />
        </div>

        <div className="form-group">
          <label htmlFor="treinamento">Treinamento</label>
          <input
            type="text"
            id="treinamento"
            name="treinamento"
            value={formData.treinamento}
            onChange={handleChange}
            placeholder="Ex: 00:00:00 ou texto"
          />
        </div>

        <div className="form-group">
          <label htmlFor="percentTreinamento">% Treinamento</label>
          <input
            type="text"
            id="percentTreinamento"
            name="percentTreinamento"
            value={formData.percentTreinamento}
            onChange={handleChange}
            placeholder="Ex: 0.0%"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
            Voltar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Indicadores'}
          </button>
        </div>
      </form>

      <div className="generate-feedback-section">
        <h2>Gerar Feedback com IA</h2>
        <p>Após salvar os indicadores, clique no botão abaixo para gerar o feedback automaticamente.</p>
        <button
          onClick={handleGenerateFeedback}
          className="btn btn-ai"
          disabled={generating}
        >
          {generating ? 'Gerando Feedback...' : '🤖 Gerar Feedback com IA'}
        </button>
      </div>
    </div>
  );
}

export default IndicatorsForm;

