# 🇩🇿 EcoSecure DZ - Smart Circular Economy Platform

![Project Status](https://img.shields.io/badge/Status-Prototype-emerald) ![Python](https://img.shields.io/badge/Python-3.x-blue) ![Framework](https://img.shields.io/badge/Framework-NiceGUI-orange)

**EcoSecure DZ** is a comprehensive digital platform designed to revolutionize waste management in Algeria. By leveraging AI and a gamified experience, it connects citizens, industrial recyclers, and logistics companies to foster a sustainable circular economy.

---

##  Key Features

###  1. Citizen Super App (Gamification)
* **Scan & Earn:** Simulated Computer Vision interface to scan waste items.
* **Eco-Points System:** Earn points for every recyclable item scanned.
* **Local Rewards:** Redeem points for **Flexy** (Mobile Credit: Mobilis, Djezzy, Ooredoo), Cinema tickets, and Metro d'Alger passes.
* **Wallet:** Real-time balance tracking.

###  2. B2B Industrial Marketplace
* **Waste Trading:** A digital market for trading raw materials like *Iron Tailings (Gara Djebilet)*, *Used Cooking Oil*, and *PET Plastics*.
* **Smart Filtering:** Filter listings by category (Mining, Organic, Plastic).
* **Negotiation Engine:** A specialized bidding system allowing buyers to negotiate prices (+/- 100 DA) directly with sellers.
* **Detailed Insights:** View purity percentages, quality grades, and available quantities.

###  3. Smart Logistics (AI Routing)
* **VRP Solver:** Implements the **Traveling Salesperson Problem (TSP)** algorithm using the Nearest Neighbor logic.
* **Interactive Map:** Visualizes the optimal route to collect waste from filled containers (Zone A, B, C, D) back to the Depot.
* **Cost Efficiency:** Calculates collected waste volume and optimized travel distance to reduce fuel consumption.

---

##  Tech Stack

* **Language:** Python 3.9+
* **UI Framework:** [NiceGUI](https://nicegui.io/) (Vue.js based Python wrapper)
* **Styling:** Tailwind CSS (integrated via NiceGUI)
* **Mapping:** Leaflet.js (via `ui.leaflet`)
* **Algorithms:** Custom TSP Nearest Neighbor implementation for route optimization.

---

##  Installation & Setup

### Prerequisites
Ensure you have Python installed on your system.

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/ecosecure-dz.git](https://github.com/yourusername/ecosecure-dz.git)
cd ecosecure-dz
