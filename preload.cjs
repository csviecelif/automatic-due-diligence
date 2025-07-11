
const { contextBridge, ipcRenderer } = require('electron');

// Expõe uma API segura para o processo de renderização (a aplicação React)
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Envia os dados dos casos para serem salvos no arquivo local.
   * @param {object} data - O objeto contendo os casos a serem salvos.
   */
  saveData: (data) => ipcRenderer.send('save-data', data),

  /**
   * Solicita o carregamento dos dados do arquivo local.
   * @returns {Promise<object|null>} Uma promessa que resolve com os dados carregados ou null se não houver dados.
   */
  loadData: () => ipcRenderer.invoke('load-data'),
});
