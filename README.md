## some values are hardcoded so that its easier for you to run i also made sure it runs using the env and i kept an example .env file if you need to run it locally 

## System Architecture

**Backend API:** http://34.58.121.43:8080/  
**Frontend Application:** http://34.58.121.43:3000/

## backend runs 
![image](https://github.com/user-attachments/assets/8b4de711-78ff-4d05-9d60-39f35df13dda)


## ⚡ Quick Start

## 🛠️ Tech Stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Recharts
- **Backend:** Node.js + Express + TypeScript + SQLite
- **Background Jobs:** node-cron
- **HTTP Client:** Axios

# no need for env setup the api is set in the code using ```||```  

### Backend Setup
```bash
cd backend
npm install
npm run dev  # Runs on http://localhost:3001
```

### Frontend Setup  
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

## frontend looks meh but i kept it useable and responsive it has all the info needed 

![image](https://github.com/user-attachments/assets/2059ba58-9858-4258-a6b0-775045a7b979)

![image](https://github.com/user-attachments/assets/8e335dd1-de0c-455a-87a4-ed3f8333071e)



## 📡 API Endpoints

### Block Data
- `GET /api/blocks?limit=N` - Get recent blocks
- `GET /api/blocks/stats` - Block statistics
- `GET /api/blocks/latest` - Latest block number

### Collector Control
- `GET /api/collector/status` - Collector status & stats
- `POST /api/collector/trigger` - Manual collection
- `POST /api/collector/start` - Start auto-collection
- `POST /api/collector/stop` - Stop auto-collection

### Database Management
- `GET /api/database/stats` - Database statistics
- `POST /api/database/cleanup` - Smart cleanup
- `POST /api/database/optimize` - Optimize database
- `DELETE /api/database/clear` - Clear all data ⚠️

**Example API Call:**
```bash
curl http://34.58.121.43:8080/api/blocks/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "averageBlockTime": 12,
    "totalTransactionsLast100": 1500,
    "latestBlockNumber": 2445282
  }
}
```

## 🎛️ Dashboard Features


- **📊 Real-time Stats Cards** - Latest block, average block time, total transactions, database size
- **📈 Interactive Charts** - Block metrics and transaction count visualization
- **🎛️ System Controls** - Start/stop collector, manual triggers, collector statistics
- **📋 Recent Blocks Table** - Latest blocks with transaction counts, gas usage, and timestamps
- **🗄️ Database Management** - Smart cleanup (keep latest N blocks, delete old data), optimization, and export tools 
- **🔄 Auto-refresh** - Live updates every 30 seconds without manual intervention
- **📱 Responsive Design** - Works on desktop, tablet, and mobile devices

## ⚙️ How It Works

The Coqnet Explorer automatically fetches the latest block data from the Coqnet blockchain API every 30 seconds using a background cron job. Each new block is stored in a local SQLite database with details like block number, timestamp, transaction count, and gas usage. The React dashboard connects to the backend API to display real-time statistics, interactive charts, and a table of recent blocks. Users can control the collector (start/stop/trigger), manage the database (cleanup old blocks, optimize performance), and view live analytics - all updating automatically without manual refresh.

**Flow:** `Coqnet API` → `Background Collector` → `SQLite Database` → `REST API` → `React Dashboard`



