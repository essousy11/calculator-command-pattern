

import React, { useState } from 'react';
import CommandManager from './commands/CommandManager';
import './App.css';
import CosCommand from './commands/CosCommand';
import TanCommand from './commands/TanCommand';
import LogCommand from './commands/LogCommand';
import SinCommand from './commands/SinCommand';

// Initialisation du gestionnaire de commandes
//Le CommandManager agit comme un invocateur qui gère l'enregistrement et l'exécution des commandes.
// Cela permet d'associer un nom d'opération à une instance de commande.
const commandManager = new CommandManager();
commandManager.registerCommand('tan', new TanCommand());
commandManager.registerCommand('log', new LogCommand());
commandManager.registerCommand('sin', new SinCommand());
commandManager.registerCommand('cos', new CosCommand());

const App = () => {
  // États pour gérer l'expression actuelle, le résultat et l'historique
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [commands, setCommands] = useState({});
  const [history, setHistory] = useState([]); // Historique des états pour undo/redo
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Fonction pour créer un champ d'importation de fichiers
  const createFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/javascript'; // Accepte uniquement les fichiers JavaScript
    input.onchange = handleFileChange;
    return input;
  };

  // Gestionnaire de modification de fichier, lit le contenu du plugin
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        await importPlugin(e.target.result, file.name.split('.')[0]); // Importe le plugin avec son nom
      };
      reader.readAsText(file);
    }
  };

  // Fonction pour importer dynamiquement un plugin et l'ajouter au gestionnaire de commandes
  const importPlugin = async (moduleContent, pluginType) => {
    const blob = new Blob([moduleContent], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);

    try {
      const module = await import(/* webpackIgnore: true */ url); // Charge dynamiquement le plugin
      const command = new (module.default)(); // Instancie la commande
      setCommands((prevCommands) => {
        const newCommands = { ...prevCommands };
        if (!newCommands[pluginType]) {
          newCommands[pluginType] = [];
        }
        newCommands[pluginType].push({ name: pluginType, command });
        return newCommands;
      });
    } catch (error) {
      console.error('Erreur lors de l’importation du plugin :', error);
      alert("Erreur lors de l’importation du plugin");
    } finally {
      URL.revokeObjectURL(url); // Nettoie l'URL pour éviter les fuites de mémoire
    }
  };

  // Fonction pour ouvrir le champ d'importation
  const handleImport = () => {
    const input = createFileInput();
    input.click();
  };

  // Gestionnaire de clic sur un bouton pour mettre à jour l'expression
  const handleButtonClick = (value) => {
    setExpression((prev) => prev + value);
    updateHistory(expression + value);
  };

  // Fonction pour réinitialiser l'expression et le résultat
  const handleClear = () => {
    setExpression('');
    setResult('');
    updateHistory('');
  };

  // Évaluation de l'expression mathématique en utilisant les commandes enregistrées
  const handleCalculate = () => {
    try {
      let evaluatedResult = expression;

      // Remplace les fonctions spéciales (sin, log, tan, cos) par leurs résultats
      evaluatedResult = evaluatedResult
        .replace(/sin\(([^)]+)\)/g, (_, match) => {
          const value = parseFloat(match);
          if (isNaN(value)) throw new Error('Expression invalide');
          // Le gestionnaire exécute les commandes dynamiquement en fonction du nom de l'opération :
          // Application du Design Pattern Command dans le Calcul
          return commandManager.executeCommand('sin', value);
        })
        .replace(/log\(([^)]+)\)/g, (_, match) => {
          const value = parseFloat(match);
          if (isNaN(value) || value <= 0) throw new Error('Expression invalide');
          return commandManager.executeCommand('log', value);
        })
        .replace(/tan\(([^)]+)\)/g, (_, match) => {
          const value = parseFloat(match);
          if (isNaN(value)) throw new Error('Expression invalide');
          return commandManager.executeCommand('tan', value);
        })
        .replace(/cos\(([^)]+)\)/g, (_, match) => {
          const value = parseFloat(match);
          if (isNaN(value)) throw new Error('Expression invalide');
          return commandManager.executeCommand('cos', value);
        });

      // Évalue le reste de l'expression mathématique
      const finalResult = eval(evaluatedResult);
      setResult(finalResult.toString());
      setExpression(finalResult.toString());
      updateHistory(finalResult.toString());
    } catch (error) {
      console.error('Erreur lors de l’évaluation de l’expression :', error);
      setResult('Erreur');
    }
  };

  // Met à jour l'historique des expressions
  const updateHistory = (newExpression) => {
    const newHistory = history.slice(0, currentIndex + 1); // Tronque l'historique après l'index actuel
    newHistory.push(newExpression);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  // Gère l'action "refaire"
  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      const redoExpression = history[currentIndex + 1];
      setExpression(redoExpression);
      setResult(redoExpression);
      setCurrentIndex(currentIndex + 1);
    }
  };
 
  // Gère l'action "annuler"
  const handleUndo = () => {
    if (currentIndex > 0) {
      const undoExpression = history[currentIndex - 1];
      setExpression(undoExpression);
      setResult(undoExpression);
      setCurrentIndex(currentIndex - 1);
    }
  };

  // reset all plugins 
  const handleResetPlugins = () => {
    setCommands({}); // Clear all commands
    alert("All plugins have been reset.");
  };
  

  // Rend les boutons des plugins dynamiquement
  const renderPluginButtons = (operation) => {
    const operatorSymbols = {
      AddCommand: '+',
      SubtractCommand: '-',
      MultiplyCommand: '*',
      DivideCommand: '/',
      CosCommand: 'cos(',
      SinCommand: 'sin(',
      LogCommand: 'log(',
      TanCommand: 'tan(',
    };
    return commands[operation]?.map((command, index) => (
      <div className="col" key={index}>
        <button className="btn btn-secondary" onClick={() => handleButtonClick(operatorSymbols[operation])}>
          {operatorSymbols[operation]}
        </button>
      </div>
    ));
  };

  // Interface utilisateur principale
  return (
    <div className="container mt-5">
      {/* Zone interactive pour importer des plugins */}
      <div
        onDoubleClick={handleImport}
        className="import-zone text-center mb-4"
        style={{
          border: '2px solid blue',
          padding: '30px',
          borderRadius: '12px',
          backgroundColor: '#f0f8ff',
        }}
      >
        <p>Add a plugin</p>
      </div>

      {/* Affichage de l'expression et du résultat */}
      {/* <input type="text" className="form-control mt-3 mb-3" value={expression} readOnly />
      <input type="text" className="form-control mb-3" value={result} readOnly placeholder="Result" /> */}

<input
  type="text"
  className="form-control mt-3 mb-3 expression-field mb-4"
  value={expression}
  readOnly
  style={{
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'right',
    backgroundColor: '#f9f9f9',
    border: '2px solid #ccc',
    borderRadius: '8px',
  }}
/>
<input
  type="text"
  className="form-control mb-3 result-field mb-4"
  value={result}
  readOnly
  placeholder="Result"
  style={{
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'right',
    backgroundColor: '#f0f8ff',
    border: '2px solid #007bff',
    borderRadius: '8px',
    color: result === 'Erreur' ? 'red' : '#000',
  }}
/>

      
      {/* Boutons de la calculatrice */}
      {[
        ['1', '2', '3', 'cos('],
        ['4', '5', '6', ')'],
        ['7', '8', '9', '*'],
        ['0', 'C', '=', '/'],
      ].map((row, rowIndex) => (
        <div className="row" key={rowIndex}>
          {row.map((value, colIndex) => (
            <div className="col" key={colIndex}>
              <button
                className={`btn ${value === 'C' ? 'btn-secondary' : 'btn-primary'} mb-2`}
                onClick={
                  value === '='
                    ? handleCalculate
                    : value === 'C'
                    ? handleClear
                    : () => handleButtonClick(value)
                }
              >
                {value}
              </button>
            </div>
          ))}
        </div>
      ))}

      {/* Boutons "annuler" et "refaire" */}
      <button className="btn btn-warning mb-2" onClick={handleRedo}>
        Redo
      </button>
      <button className="btn btn-warning mb-2" onClick={handleUndo}>
        Undo
      </button>
      <button className="btn btn-danger mb-4" onClick={handleResetPlugins}>
        Reset Plugins
      </button>

      {/* Section des plugins dynamiques */}
      <div className="col-md-6">
        {Object.keys(commands).map((operation) => (
          <div key={operation}>
            <div className="row mt-3">{renderPluginButtons(operation)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
