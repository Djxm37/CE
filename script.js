document.addEventListener('DOMContentLoaded', function() {
    let gameData = {};
    let currentKey = Math.floor(Math.random() * 25) + 1; // Clé aléatoire 1-25
    let puzzleAssembled = false;
    let keyFound = false;

    // Charger les données du jeu via AJAX (simulé avec un objet)
    function loadGameData() {
        // Simulation AJAX : en vrai, fetch depuis un fichier JSON
        gameData = {
            puzzlePieces: [
                { id: 1, content: 'Frag1', color: '#FF0000' },
                { id: 2, content: 'Frag2', color: '#00FF00' },
                { id: 3, content: 'Frag3', color: '#0000FF' },
                { id: 4, content: 'Frag4', color: '#FFFF00' },
                { id: 5, content: 'Frag5', color: '#FF00FF' },
                { id: 6, content: 'Frag6', color: '#00FFFF' },
                { id: 7, content: 'Frag7', color: '#800000' },
                { id: 8, content: 'Frag8', color: '#008000' },
                { id: 9, content: 'Frag9', color: '#000080' }
            ],
            originalText: "La cryptographie est l'art de proteger les secrets",
            encryptedText: caesarCipher("La cryptographie est l art de proteger les secrets", currentKey)
        };
        console.log('Clé secrète :', currentKey); // Pour debug, retirez en prod
    }

    // Fonction de chiffrement César
    function caesarCipher(text, shift) {
        return text.replace(/[a-z]/gi, function(char) {
            const base = char <= 'Z' ? 65 : 97;
            return String.fromCharCode(((char.charCodeAt(0) - base + shift + 26) % 26) + base);
        });
    }

    // Initialiser le puzzle
    function initPuzzle() {
        const grid = document.getElementById('puzzle-grid');
        const piecesContainer = document.getElementById('pieces-container');
        grid.innerHTML = '';
        piecesContainer.innerHTML = '';

        // Créer les emplacements vides dans la grille
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'piece-slot';
            slot.dataset.index = i;
            grid.appendChild(slot);
        }

        // Créer les pièces draggables
        gameData.puzzlePieces.forEach(piece => {
            const pieceDiv = document.createElement('div');
            pieceDiv.className = 'piece';
            pieceDiv.draggable = true;
            pieceDiv.dataset.id = piece.id;
            pieceDiv.style.backgroundColor = piece.color;
            pieceDiv.textContent = piece.content;
            piecesContainer.appendChild(pieceDiv);

            // Drag and drop
            pieceDiv.addEventListener('dragstart', dragStart);
        });

        // Événements pour les slots
        document.querySelectorAll('.piece-slot').forEach(slot => {
            slot.addEventListener('dragover', dragOver);
            slot.addEventListener('drop', drop);
        });
    }

    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        const pieceId = e.dataTransfer.getData('text/plain');
        const piece = document.querySelector(`[data-id="${pieceId}"]`);
        if (piece && e.target.classList.contains('piece-slot') && !e.target.hasChildNodes()) {
            e.target.appendChild(piece);
        }
    }

    // Valider le puzzle
    document.getElementById('validate-puzzle').addEventListener('click', function() {
        const slots = document.querySelectorAll('.piece-slot');
        let assembled = true;
        slots.forEach((slot, index) => {
            if (!slot.hasChildNodes() || parseInt(slot.firstChild.dataset.id) !== index + 1) {
                assembled = false;
            }
        });
        if (assembled) {
            puzzleAssembled = true;
            const encryptedDisplay = document.getElementById('encrypted-text');
            if (encryptedDisplay) {
                encryptedDisplay.textContent = 'Message chiffré : ' + gameData.encryptedText;
                encryptedDisplay.style.display = 'block';
            }
            alert('Puzzle assemblé ! Message chiffré révélé.');
            showStage('key-stage');
        } else {
            alert('Puzzle incomplet. Essaie encore.');
        }
    });

    // Indices
    document.querySelectorAll('.hint-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            alert(this.dataset.hint);
        });
    });

    // Valider la clé
    document.getElementById('validate-key').addEventListener('click', function() {
        const inputKey = parseInt(document.getElementById('key-input').value);
        if (inputKey === currentKey) {
            keyFound = true;
            alert('Clé correcte ! Passe au déchiffrement. Souviens-toi du message chiffré !');
            showStage('decrypt-stage');
        } else {
            alert('Clé incorrecte. Utilise les indices.');
        }
    });

    // Vérifier le déchiffrement : le joueur saisit le texte déchiffré (plaintext)
    document.getElementById('decrypt-btn').addEventListener('click', function() {
        const userPlain = document.getElementById('decrypted-input').value.trim();
        const decryptKey = parseInt(document.getElementById('decrypt-key').value);

        if (!gameData.encryptedText) {
            alert("Aucun message chiffré disponible. Termine le puzzle d'abord.");
            return;
        }
        if (isNaN(decryptKey) || decryptKey < 1 || decryptKey > 25) {
            alert('Entrez une clé valide (1-25).');
            return;
        }

        // Calculer le texte déchiffré à partir du message stocké et de la clé saisie
        const computed = caesarCipher(gameData.encryptedText, (26 - decryptKey) % 26);

        if (userPlain.toLowerCase() === computed.toLowerCase()) {
            document.getElementById('decrypted-text').textContent = computed;
            document.getElementById('decrypted-text').classList.remove('hidden');
            alert('Message correct ! Victoire.');
            showStage('victory');
        } else {
            alert('Le texte déchiffré ne correspond pas. Vérifie la clé et le texte saisi.');
        }
    });

    // Démarrer le jeu (AJOUTÉ ICI - c'était manquant)
    document.getElementById('start-btn').addEventListener('click', function() {
        loadGameData();
        initPuzzle();
        showStage('puzzle-stage');
    });

    // Rejouer
    document.getElementById('restart-btn').addEventListener('click', function() {
        location.reload();
    });

    function showStage(stageId) {
        document.querySelectorAll('.stage').forEach(stage => stage.classList.add('hidden'));
        document.getElementById(stageId).classList.remove('hidden');
        // When showing decrypt stage, display the encrypted message for reference
        if (stageId === 'decrypt-stage') {
            const disp = document.getElementById('encrypted-display');
            if (disp) disp.textContent = gameData.encryptedText || '';
        }
    }

    // --- Matrix-style falling numbers background ---
    (function initMatrixBackground() {
        const canvas = document.getElementById('matrix-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = window.innerWidth;
        let height = window.innerHeight;
        let fontSize = 16;
        let columns = Math.floor(width / fontSize);
        let drops = new Array(columns).fill(1);

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            columns = Math.floor(width / fontSize);
            drops = new Array(columns).fill(1);
        }

        function draw() {
            // Slight translucent black to create the trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#00FF00';
            ctx.shadowColor = '#00FF00';
            ctx.shadowBlur = 8;
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = Math.floor(Math.random() * 10).toString();
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                ctx.fillText(text, x, y);

                if (y > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            requestAnimationFrame(draw);
        }

        // Initialize and start
        resize();
        window.addEventListener('resize', resize);
        // Pause animation when tab not visible to save CPU
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                // stop drawing by not requesting frames — we simply skip next frames
            }
        });

        draw();
    })();
});
