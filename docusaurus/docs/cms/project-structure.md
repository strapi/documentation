<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Owais Communication - Wholesale Control Panel</title>
    <style>
        :root {
            --bg-color: #060608;
            --panel-bg: #0f0f14;
            --border-color: #1f1f29;
            --text-main: #e2e2e9;
            --text-muted: #7e7e94;
            --neon-cyan: #00f0ff;
            --neon-green: #39ff14;
            --neon-amber: #ffaa00;
            --neon-red: #ff3333;
        }

        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; padding: 20px;
            background-color: var(--bg-color); color: var(--text-main); 
        }

        html { scroll-behavior: smooth; }
        
        .business-header {
            text-align: center; padding: 35px 20px;
            background: linear-gradient(135deg, #0d0d11 0%, #171722 100%);
            border-radius: 16px; margin-bottom: 30px;
            border: 1px solid var(--border-color); position: relative;
        }
        .business-header::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
            background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
        }
        .business-header h1 { 
            margin: 0; font-size: 34px; font-weight: 800; letter-spacing: 2px;
            color: #ffffff; text-transform: uppercase; text-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
        }
        .business-header p {
            margin: 8px 0 0 0; color: var(--neon-cyan); font-size: 13px;
            font-weight: 600; letter-spacing: 4px; text-transform: uppercase;
        }

        .sticky-controls {
            position: sticky; top: 0; z-index: 100;
            background-color: rgba(6, 6, 8, 0.95); backdrop-filter: blur(15px);
            padding: 10px 0 20px 0; border-bottom: 1px solid rgba(31, 31, 41, 0.5);
        }

        .brand-tabs { display: flex; justify-content: center; gap: 8px; margin-bottom: 15px; flex-wrap: wrap; }
        .tab-btn {
            background: var(--panel-bg); border: 1px solid var(--border-color); color: var(--text-main);
            padding: 8px 14px; border-radius: 20px; cursor: pointer; font-size: 11px;
            font-weight: 600; transition: all 0.2s ease; text-transform: uppercase;
        }
        .tab-btn:hover { border-color: var(--neon-cyan); color: #fff; box-shadow: 0 0 10px rgba(0, 240, 255, 0.2); }

        .controller-panel {
            background: var(--panel-bg); max-width: 800px; margin: 0 auto;
            padding: 12px 25px; border-radius: 40px; border: 1px solid var(--border-color);
            display: flex; align-items: center; justify-content: space-between; gap: 15px; flex-wrap: wrap;
        }
        .control-group { display: flex; align-items: center; gap: 10px; }
        .controller-panel label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .controller-panel select, .controller-panel input {
            background: #161622; border: 1px solid #252535; color: #fff; padding: 8px 16px; border-radius: 20px; outline: none;
        }
        .controller-panel input[type="number"] { width: 90px; text-align: center; }
        #searchInput { width: 100%; max-width: 380px; padding: 8px 20px; border-radius: 25px; background-color: #161622; color: #fff; border: 1px solid var(--border-color); outline: none; }

        .brand-section { scroll-margin-top: 220px; margin-bottom: 40px; }
        .brand-section h2 { 
            background-color: var(--panel-bg); color: var(--neon-cyan); padding: 14px 20px; margin-top: 0; margin-bottom: 15px;
            border-radius: 8px; border-left: 4px solid var(--neon-cyan); font-size: 17px;
            display: flex; align-items: center; justify-content: space-between;
        }
        .brand-section h2 span { font-size: 12px; color: var(--text-muted); background: #161622; padding: 4px 10px; border-radius: 12px; }
        
        table { width: 100%; border-collapse: collapse; background: var(--panel-bg); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); }
        th, td { border: 1px solid var(--border-color); padding: 11px 14px; text-align: left; font-size: 13px; }
        th { background-color: #14141c; color: #ffffff; font-weight: 600; text-transform: uppercase; font-size: 11px; }
        tr:nth-child(even) { background-color: #0b0b0f; }
        tr:hover { background-color: #151522; }
        tr.hidden-slot { display: none !important; } /* Khali slots ko default me chupanay k liye */
        
        .base-rate-input { background: #161622; border: 1px solid #252535; color: #fff; padding: 6px 8px; border-radius: 6px; width: 70px; text-align: center; font-size: 13px; font-weight: 600; }
        .status-select { background: #161622; border: 1px solid #252535; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; }
        .status-select.instock { color: var(--neon-green); border-color: rgba(57, 255, 20, 0.3); }
        .status-select.outofstock { color: var(--neon-red); border-color: rgba(255, 51, 51, 0.3); }
        .status-select.lowstock { color: var(--neon-amber); border-color: rgba(255, 170, 0, 0.3); }
        .rate-display { font-weight: 700; color: var(--neon-green); font-size: 14px; }
        
        .copy-btn { background-color: #161622; color: #fff; border: 1px solid var(--border-color); padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 11px; }
        .copy-btn:hover { background-color: #25d366; border-color: #25d366; }
        .copy-btn.copied { background-color: var(--neon-cyan); border-color: var(--neon-cyan); color: #000; }
        .reset-container { text-align: center; margin: 50px 0; }
        .reset-btn { background-color: #1a0f12; color: var(--neon-red); border: 1px solid rgba(255, 51, 51, 0.3); padding: 12px 24px; border-radius: 30px; cursor: pointer; font-weight: bold; }
        .reset-btn:hover { background-color: var(--neon-red); color: #fff; }
        
        .toggle-slots-container { text-align: right; max-width: 1200px; margin: 10px auto; padding-right: 20px; }
        .toggle-slots-btn { background: #161622; border: 1px solid var(--border-color); color: var(--neon-cyan); padding: 6px 15px; border-radius: 15px; cursor: pointer; font-size: 12px; font-weight: 600; }
    </style>
</head>
<body>

    <div class="business-header">
        <h1>Owais Communication</h1>
        <p>Mobile Repairing Services & Wholesale Ultimate Parts Hub</p>
    </div>

    <div class="sticky-controls">
        <div class="brand-tabs" id="brandTabsContainer"></div>
        <div class="controller-panel">
            <div class="control-group">
                <label>Margin:</label>
                <select id="markupType" onchange="renderTableData()">
                    <option value="fixed">Fixed (Rs.)</option>
                    <option value="percent">Percentage (%)</option>
                </select>
                <input type="number" id="markupValue" value="0" min="0" oninput="renderTableData()">
            </div>
            <div class="control-group">
                <input type="text" id="searchInput" onkeyup="filterList()" placeholder="Model name ya short-keyword search karein...">
            </div>
        </div>
        <div class="toggle-slots-container">
            <button class="toggle-slots-btn" id="slotToggler" onclick="toggleEmptySlots()">Show 50 Empty Slots For Editing 👁️</button>
        </div>
    </div>

    <div id="tablesContainer"></div>

    <div class="reset-container">
        <button class="reset-btn" onclick="resetToDefault()">Reset Entire Database To Code Defaults 🔄</button>
    </div>

    <script>
        let showSlots = false;

        // MASTER GENERATOR DATA (REAL RUNNING MODELS + 50 SLOTS PER BRAND)
        const baseRealData = [
            // === INFINIX ===
            { id: 1, brand: "INFINIX", name: "Infinix Hot 8 / Hot 8 Lite LCD", compatibility: "X650, Tecno Spark 4 Matrix", baseRate: 2450, stock: "instock" },
            { id: 2, brand: "INFINIX", name: "Infinix Hot 9 LCD Panel", compatibility: "X655 Lineup", baseRate: 2400, stock: "instock" },
            { id: 3, brand: "INFINIX", name: "Infinix Hot 9 Play LCD Panel", compatibility: "X680 Series Matrix", baseRate: 2450, stock: "instock" },
            { id: 4, brand: "INFINIX", name: "Infinix Hot 10 LCD Panel", compatibility: "X682 Setup", baseRate: 2500, stock: "instock" },
            { id: 5, brand: "INFINIX", name: "Infinix Hot 10 Play LCD Panel", compatibility: "X688, Smart 5 Pro (X6511)", baseRate: 2450, stock: "instock" },
            { id: 6, brand: "INFINIX", name: "Infinix Hot 10 Lite LCD Panel", compatibility: "X657B Full Match", baseRate: 2400, stock: "instock" },
            { id: 7, brand: "INFINIX", name: "Infinix Hot 11 LCD Panel", compatibility: "X662 Single Model", baseRate: 2750, stock: "instock" },
            { id: 8, brand: "INFINIX", name: "Infinix Hot 11s LCD Panel", compatibility: "X6812 High Grade", baseRate: 2850, stock: "instock" },
            { id: 9, brand: "INFINIX", name: "Infinix Hot 11 Play LCD Panel", compatibility: "X688B Structure", baseRate: 2500, stock: "instock" },
            { id: 10, brand: "INFINIX", name: "Infinix Hot 12 LCD Panel", compatibility: "X666 Regular", baseRate: 2700, stock: "instock" },
            { id: 11, brand: "INFINIX", name: "Infinix Hot 12 Play LCD Panel", compatibility: "X665, Tecno Spark 9T Flex", baseRate: 2500, stock: "instock" },
            { id: 12, brand: "INFINIX", name: "Infinix Hot 12i LCD Panel", compatibility: "X665B Direct Fit", baseRate: 2550, stock: "instock" },
            { id: 13, brand: "INFINIX", name: "Infinix Hot 30 LCD Panel", compatibility: "X668 Direct Layout", baseRate: 2800, stock: "instock" },
            { id: 14, brand: "INFINIX", name: "Infinix Hot 30i LCD Panel", compatibility: "X669 Line Setup", baseRate: 2650, stock: "instock" },
            { id: 15, brand: "INFINIX", name: "Infinix Hot 40 Pro LCD Panel", compatibility: "X6837 Premium Copy", baseRate: 3400, stock: "instock" },
            { id: 16, brand: "INFINIX", name: "Infinix Hot 40i LCD Panel", compatibility: "X6525, Tecno Pop 8, Itel A70 Combo", baseRate: 2600, stock: "instock" },
            { id: 17, brand: "INFINIX", name: "Infinix Smart 4 LCD Panel", compatibility: "X653 Pin Config", baseRate: 2350, stock: "instock" },
            { id: 18, brand: "INFINIX", name: "Infinix Smart 5 LCD Panel", compatibility: "X657 Setup Matrix", baseRate: 2450, stock: "instock" },
            { id: 19, brand: "INFINIX", name: "Infinix Smart 6 LCD Panel", compatibility: "X6511 2GB Variant", baseRate: 2450, stock: "instock" },
            { id: 20, brand: "INFINIX", name: "Infinix Smart 6 HD LCD Panel", compatibility: "X6512 Structure", baseRate: 2450, stock: "instock" },
            { id: 21, brand: "INFINIX", name: "Infinix Smart 7 LCD Panel", compatibility: "X6515 Direct Board", baseRate: 2500, stock: "instock" },
            { id: 22, brand: "INFINIX", name: "Infinix Smart 8 / Smart 8 Pro", compatibility: "Tecno Spark 20, Spark Go 2024", baseRate: 2600, stock: "instock" },
            { id: 23, brand: "INFINIX", name: "Infinix Note 7 LCD Panel", compatibility: "X690 Punch Hole", baseRate: 2800, stock: "instock" },
            { id: 24, brand: "INFINIX", name: "Infinix Note 8 / Note 8i LCD", compatibility: "X692 / X657C Matrix", baseRate: 2900, stock: "instock" },
            { id: 25, brand: "INFINIX", name: "Infinix Note 10 / 10 Pro LCD", compatibility: "X693 / X695 Framework", baseRate: 3100, stock: "instock" },
            { id: 26, brand: "INFINIX", name: "Infinix Note 11 / Note 11 Pro", compatibility: "X663 / X697 Lineup", baseRate: 2950, stock: "instock" },
            { id: 27, brand: "INFINIX", name: "Infinix Note 12 G96 LCD Panel", compatibility: "X663B (Amoled Copy Version)", baseRate: 6500, stock: "instock" },
            { id: 28, brand: "INFINIX", name: "Infinix Note 30 4G LCD Panel", compatibility: "X6833 Wide Screen", baseRate: 3200, stock: "instock" },
            { id: 29, brand: "INFINIX", name: "Infinix Note 40 4G LCD Panel", compatibility: "X6853 Glass Structure", baseRate: 3600, stock: "instock" },

            // === TECNO ===
            { id: 40, brand: "TECNO", name: "Tecno Spark 4 LCD Panel", compatibility: "KC2, Infinix Hot 8 System", baseRate: 2450, stock: "instock" },
            { id: 41, brand: "TECNO", name: "Tecno Spark 5 / 5 Pro LCD", compatibility: "KD7 / KD7h Matrix", baseRate: 2400, stock: "instock" },
            { id: 42, brand: "TECNO", name: "Tecno Spark 6 LCD Panel", compatibility: "KE7 Pin Setup", baseRate: 2550, stock: "instock" },
            { id: 43, brand: "TECNO", name: "Tecno Spark 6 Go LCD Panel", compatibility: "KE5, Infinix Smart 5 Base", baseRate: 2400, stock: "instock" },
            { id: 44, brand: "TECNO", name: "Tecno Spark 7 LCD Panel", compatibility: "KF6 Structural Fit", baseRate: 2450, stock: "instock" },
            { id: 45, brand: "TECNO", name: "Tecno Spark 8 LCD Panel", compatibility: "KG6 Regular Board", baseRate: 2500, stock: "instock" },
            { id: 46, brand: "TECNO", name: "Tecno Spark 8 Pro LCD Panel", compatibility: "KG8 HD Version", baseRate: 2900, stock: "instock" },
            { id: 47, brand: "TECNO", name: "Tecno Spark 9 / 9 Pro LCD", compatibility: "KH6 / KH7 System", baseRate: 2650, stock: "instock" },
            { id: 48, brand: "TECNO", name: "Tecno Spark 10 4G LCD Panel", compatibility: "KI5 Common Ribbon", baseRate: 2650, stock: "instock" },
            { id: 49, brand: "TECNO", name: "Tecno Spark 10 Pro LCD Panel", compatibility: "KI7 Original Layer", baseRate: 2800, stock: "instock" },
            { id: 50, brand: "TECNO", name: "Tecno Spark 20 LCD Panel", compatibility: "Spark Go 2024, Smart 8 Pro Frame", baseRate: 2600, stock: "instock" },
            { id: 51, brand: "TECNO", name: "Tecno Spark 20 Pro LCD Panel", compatibility: "KJ6 Version Flat", baseRate: 3100, stock: "instock" },
            { id: 52, brand: "TECNO", name: "Tecno Pop 5 / Pop 5 LTE LCD", compatibility: "BD2 / BD4 Connectors", baseRate: 2350, stock: "instock" },
            { id: 53, brand: "TECNO", name: "Tecno Pop 6 Pro LCD Panel", compatibility: "BE7 Glass Setup", baseRate: 2400, stock: "instock" },
            { id: 54, brand: "TECNO", name: "Tecno Pop 7 / Pop 7 Pro LCD", compatibility: "BF6 / BF7 Common Matrix", baseRate: 2500, stock: "instock" },
            { id: 55, brand: "TECNO", name: "Tecno Pop 8 LCD Panel", compatibility: "Infinix Hot 40i, Itel A70 Alignment", baseRate: 2600, stock: "instock" },
            { id: 56, brand: "TECNO", name: "Tecno Camon 15 / 15 Pro LCD", compatibility: "CD7 / CD8 Layout", baseRate: 2650, stock: "instock" },
            { id: 57, brand: "TECNO", name: "Tecno Camon 16 LCD Panel", compatibility: "CE7 Wide Flexible", baseRate: 2700, stock: "instock" },
            { id: 58, brand: "TECNO", name: "Tecno Camon 17 / 17 Pro LCD", compatibility: "CG6 / CG8 System", baseRate: 2850, stock: "instock" },
            { id: 59, brand: "TECNO", name: "Tecno Camon 18 / 18 Premier", compatibility: "CH6 / CH9 Combo Structure", baseRate: 3100, stock: "instock" },
            { id: 60, brand: "TECNO", name: "Tecno Camon 19 / 19 Neo LCD", compatibility: "CH6i Base Architecture", baseRate: 3100, stock: "instock" },
            { id: 61, brand: "TECNO", name: "Tecno Camon 20 / 20 Pro LCD", compatibility: "CK6 / CK7 (OLED Market Copy)", baseRate: 5400, stock: "instock" },
            { id: 62, brand: "TECNO", name: "Tecno Pova 2 LCD Panel", compatibility: "LE7 Heavy Flex", baseRate: 2950, stock: "instock" },
            { id: 63, brand: "TECNO", name: "Tecno Pova 3 LCD Panel", compatibility: "LF7 Original Width", baseRate: 3250, stock: "instock" },
            { id: 64, brand: "TECNO", name: "Tecno Pova Neo LCD Panel", compatibility: "LE6 Dynamic Board", baseRate: 2600, stock: "instock" },
            { id: 65, brand: "TECNO", name: "Tecno Pova 5 / 5 Pro LCD", compatibility: "LH7n / LH8n Setup", baseRate: 3450, stock: "instock" },

            // === ITEL ===
            { id: 80, brand: "ITEL", name: "Itel A16 / A16 Plus LCD", compatibility: "Old Segment Small Matrix", baseRate: 1400, stock: "instock" },
            { id: 81, brand: "ITEL", name: "Itel A33 / A36 LCD Panel", compatibility: "Classic Budget Screen", baseRate: 1650, stock: "instock" },
            { id: 82, brand: "ITEL", name: "Itel A48 LCD Panel", compatibility: "L6006 Structural Panel", baseRate: 2200, stock: "instock" },
            { id: 83, brand: "ITEL", name: "Itel A49 LCD Panel", compatibility: "A661W Connector Line", baseRate: 2350, stock: "instock" },
            { id: 84, brand: "ITEL", name: "Itel A56 / A56 Pro LCD Panel", compatibility: "W6004 Wide Screen", baseRate: 2250, stock: "instock" },
            { id: 85, brand: "ITEL", name: "Itel A60 / A60s LCD Panel", compatibility: "A662L Common Flex", baseRate: 2500, stock: "instock" },
            { id: 86, brand: "ITEL", name: "Itel A70 LCD Panel", compatibility: "A665L, Tecno Pop 8, Hot 40i Link", baseRate: 2600, stock: "instock" },
            { id: 87, brand: "ITEL", name: "Itel Vision 1 / 1 Plus LCD", compatibility: "L6501 Direct Main Track", baseRate: 2300, stock: "instock" },
            { id: 88, brand: "ITEL", name: "Itel Vision 2 / 2 Plus LCD", compatibility: "L6503 / L6504 Dual Match", baseRate: 2400, stock: "instock" },
            { id: 89, brand: "ITEL", name: "Itel Vision 3 / 3 Plus LCD", compatibility: "S661L Matrix Block", baseRate: 2450, stock: "instock" },
            { id: 90, brand: "ITEL", name: "Itel Vision 5 LCD Panel", compatibility: "Single Version Board", baseRate: 2600, stock: "instock" },
            { id: 91, brand: "ITEL", name: "Itel P33 / P33 Plus LCD", compatibility: "Old Generation Power Unit", baseRate: 1950, stock: "instock" },
            { id: 92, brand: "ITEL", name: "Itel P36 / P36 Pro LCD Panel", compatibility: "Standard Core Grid", baseRate: 2350, stock: "instock" },
            { id: 93, brand: "ITEL", name: "Itel P37 / P37 Pro LCD Panel", compatibility: "Ribbon Version Update", baseRate: 2400, stock: "instock" },
            { id: 94, brand: "ITEL", name: "Itel P40 LCD Panel", compatibility: "P662L High Frame Rate", baseRate: 2550, stock: "instock" },
            { id: 95, brand: "ITEL", name: "Itel S15 / S15 Pro LCD Panel", compatibility: "Legacy S-Matrix", baseRate: 2100, stock: "instock" },
            { id: 96, brand: "ITEL", name: "Itel S16 / S16 Pro LCD Panel", compatibility: "Clear View System", baseRate: 2300, stock: "instock" },

            // === SAMSUNG ===
            { id: 110, brand: "SAMSUNG", name: "Samsung A10 / M10 LCD Panel", compatibility: "A105 / M105 Dual Line", baseRate: 2200, stock: "instock" },
            { id: 111, brand: "SAMSUNG", name: "Samsung A10s LCD Panel", compatibility: "A107 Ribbon Form", baseRate: 2250, stock: "instock" },
            { id: 112, brand: "SAMSUNG", name: "Samsung A11 / M11 LCD Panel", compatibility: "A115 / M115 Board Fit", baseRate: 2300, stock: "instock" },
            { id: 113, brand: "SAMSUNG", name: "Samsung A12 / M12 LCD Panel", compatibility: "A125 / M127 Nacho Combo", baseRate: 2400, stock: "instock" },
            { id: 114, brand: "SAMSUNG", name: "Samsung A13 4G LCD Panel", compatibility: "A135 Direct Connector", baseRate: 2600, stock: "instock" },
            { id: 115, brand: "SAMSUNG", name: "Samsung A14 4G LCD Panel", compatibility: "A145 Single Block", baseRate: 2750, stock: "instock" },
            { id: 116, brand: "SAMSUNG", name: "Samsung A15 4G LCD Panel", compatibility: "A155 Incell Upgrade", baseRate: 3100, stock: "instock" },
            { id: 117, brand: "SAMSUNG", name: "Samsung A01 / A01 Core LCD", compatibility: "A015 / A013 Setup", baseRate: 2150, stock: "instock" },
            { id: 118, brand: "SAMSUNG", name: "Samsung A02 / M02 LCD Panel", compatibility: "A
