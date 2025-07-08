## some values are hardcoded so that its easier for you to run i also made sure it runs using the env and i kept an example .env file

## will host tommorow morning and update the readme with the live link its late now but i wanted to get it working 

live link :

img 1 here 

## ⚡ Quick Start

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

### Verify Setup
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

![Setup Complete](./screenshots/setup.png)
<!-- TODO: Add screenshot of both services running -->

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
curl "http://localhost:3001/api/blocks/stats"
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

