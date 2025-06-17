try {
    // Pedimos ao Node para encontrar o caminho exato do pacote
    const pathToModule = require.resolve('json-server');
    console.log('✅ SUCESSO! O módulo "json-server" foi encontrado.');
    console.log(`Ele está localizado em: ${pathToModule}`);
  } catch (error) {
    console.error('❌ FALHA! O Node.js não conseguiu encontrar o "json-server".');
    console.error('Isso confirma um problema no ambiente, não no código do servidor.');
    // console.error(error); // Descomente para ver o erro completo
  }