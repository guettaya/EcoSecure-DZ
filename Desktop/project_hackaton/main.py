from nicegui import ui
import asyncio
import random
from datetime import datetime

# --- 1. CONFIGURATION & STATE ---
# "Flat Design" colors for a modern, clean look
colors = {
    'primary': '#1b5e20',    # Deep Green (Eco)
    'secondary': '#4caf50',  # Bright Green
    'accent': '#ff6f00',     # Orange (Action)
    'dark': '#1a1a1a',
    'light': '#f8f9fa'
}

# App State (Simulating Database)
state = {
    'points': 1450,
    'tab': 'citizen',
    'user': 'Ahmed',
    'id': '8821'
}

# --- 2. DIJKSTRA ALGORITHM LOGIC (PDF Feature: Smart Routing) ---
# Graph: Distances between zones (Depot, A, B, C, D, E)
graph = {
    'Depot': {'Zone A': 2, 'Zone B': 5},
    'Zone A': {'Depot': 2, 'Zone C': 4, 'Zone D': 1},
    'Zone B': {'Depot': 5, 'Zone D': 2, 'Zone E': 4},
    'Zone C': {'Zone A': 4, 'Zone E': 2},
    'Zone D': {'Zone A': 1, 'Zone B': 2, 'Zone E': 1},
    'Zone E': {'Zone B': 4, 'Zone C': 2, 'Zone D': 1}
}

# IoT Sensor Simulation: 'Empty' bins are ignored to save fuel
bin_status = {
    'Zone A': 'Full',
    'Zone B': 'Empty', 
    'Zone C': 'Full',
    'Zone D': 'Full',
    'Zone E': 'Empty'
}

def calculate_smart_route():
    """
    Simulates Dijkstra's result: Visits ONLY 'Full' bins.
    """
    # 1. Filter Targets
    targets = [z for z, s in bin_status.items() if s == 'Full']
    
    # 2. Simulate Path (Depot -> Closest Full -> ... -> Depot)
    # Logic: Skip B and E because they are empty
    path = ['Depot'] + sorted(targets) + ['Depot']
    
    # 3. Calculate Savings
    total_dist = 12 + random.randint(0, 2) # Simulated optimal distance
    fuel_saved = "3.5 L"
    time_saved = "45 mins"
    
    return path, total_dist, fuel_saved, time_saved

# --- 3. UI COMPONENTS (Modern V0 Style) ---

def create_header(title, subtitle, icon):
    with ui.element('div').classes('w-full bg-gradient-to-r from-green-900 to-green-600 text-white h-48 rounded-b-[35px] shadow-lg p-6 mb-6 relative'):
        with ui.row().classes('w-full justify-between items-center'):
            ui.icon(icon, size='lg').classes('text-white opacity-90')
            with ui.row().classes('items-center gap-2'):
                ui.label(datetime.now().strftime("%H:%M")).classes('font-mono opacity-80')
                ui.icon('notifications', size='md').classes('opacity-80 cursor-pointer')
        
        ui.label(title).classes('text-3xl font-bold mt-6 tracking-tight')
        ui.label(subtitle).classes('text-sm text-green-100 opacity-80')

def create_action_card(icon, label, sublabel, color='green', on_click=None):
    with ui.card().classes('w-full bg-white/90 backdrop-blur shadow-sm border border-gray-100 items-center p-3 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform').on('click', on_click):
        ui.icon(icon, size='md').classes(f'text-{color}-700 bg-{color}-50 p-2 rounded-full mb-1')
        ui.label(label).classes('text-lg font-bold text-gray-800 leading-none')
        ui.label(sublabel).classes('text-[10px] text-gray-500 uppercase font-bold')

def create_market_offer(tag, title, location, price, tag_color='red'):
    with ui.card().classes(f'w-full mb-3 shadow-sm hover:shadow-md transition-all rounded-xl border-l-4 border-{tag_color}-600 bg-white'):
        with ui.row().classes('w-full justify-between items-start'):
            ui.label(tag).classes(f'bg-{tag_color}-50 text-{tag_color}-800 text-[10px] px-2 py-1 rounded font-bold')
            ui.icon('verified', size='xs').classes(f'text-{tag_color}-600')
        
        ui.label(title).classes('text-md font-bold text-gray-800 mt-1')
        ui.label(location).classes('text-xs text-gray-500 mb-3')
            
        with ui.row().classes('w-full justify-between items-center pt-2 border-t border-gray-50'):
            ui.label(price).classes(f'text-{tag_color}-700 font-bold text-sm')
            ui.button('BID', color=f'{tag_color}-700').props('flat dense size=sm')

# --- 4. APP VIEWS ---

def citizen_view():
    create_header(f"Hello, {state['user']}", "EcoSecure Prime Member", "person_pin")
    
    with ui.column().classes('w-full px-4 gap-4 -mt-10 animate-fade-in'):
        # 1. POINTS CARD (PDF Feature: Rewards)
        with ui.card().classes('w-full h-44 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden'):
            ui.element('div').classes('absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl')
            with ui.row().classes('w-full justify-between items-center'):
                ui.icon('eco', size='md').classes('text-green-400')
                ui.label('PREMIUM').classes('font-bold tracking-widest text-[10px] opacity-60')
            ui.space()
            ui.label(f'{state["points"]} pts').classes('text-4xl font-bold font-mono tracking-tighter')
            ui.label('Redeemable for Flexy & Transport').classes('text-green-400 text-xs')

        # 2. QUICK ACTIONS (PDF Feature: Flexy & Metro)
        ui.label('Redeem Rewards').classes('text-md font-bold text-gray-800 ml-1 mt-2')
        with ui.grid(columns=3).classes('w-full gap-2'):
            create_action_card('smartphone', 'Flexy', 'Djezzy/Mobilis', 'blue', lambda: ui.notify('100 DA Flexy Sent!', type='positive'))
            create_action_card('train', 'Metro', 'Ticket', 'orange', lambda: ui.notify('Metro Ticket Generated!', type='positive'))
            create_action_card('shopping_bag', 'Deals', 'Coupons', 'purple')

        # 3. AI SCAN (PDF Feature: Human Sensor)
        with ui.button(on_click=lambda: ui.notify('AI Analysis: Plastic Detected! +100 Points', type='positive', position='top')).classes('w-full h-14 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-amber-500 mt-2'):
            with ui.row().classes('items-center gap-2'):
                ui.icon('center_focus_weak', size='md').classes('text-white')
                ui.label('Snap Waste (AI Scan)').classes('text-white font-bold')

def market_view():
    create_header("Industrial Market", "Circular Economy B2B", "storefront")
    
    with ui.column().classes('w-full px-4 gap-4 -mt-10'):
        ui.label('Active Listings').classes('text-lg font-bold text-gray-800 ml-1')
        
        # PDF Feature: Gara Djebilet
        create_market_offer('MINING', 'Iron Tailings (High Density)', 'Gara Djebilet, Tindouf', 'Open Bid', 'red')
        
        # PDF Feature: Bio-fuel
        create_market_offer('ORGANIC', 'Used Cooking Oil (500L)', 'Algiers Hotel Chain', '150 DZD/L', 'green')
        
        # PDF Feature: Construction
        create_market_offer('CONSTRUCTION', 'Concrete Debris (Crushed)', 'Oran Metro Site', 'Free Pickup', 'gray')

def logistics_view():
    create_header("Smart Logistics", "Dijkstra Optimization", "local_shipping")
    
    with ui.column().classes('w-full px-4 gap-4 -mt-10 pb-24'):
        
        # 1. IoT STATUS (PDF Feature: Bin Sensors)
        with ui.card().classes('w-full p-4 bg-white rounded-xl shadow-sm border border-gray-100'):
            ui.label('Live IoT Sensors').classes('font-bold text-gray-700 mb-2')
            with ui.column().classes('w-full gap-2'):
                for zone, status in bin_status.items():
                    color = 'red' if status == 'Full' else 'green'
                    with ui.row().classes('w-full justify-between items-center p-2 bg-gray-50 rounded-lg'):
                        with ui.row().classes('items-center gap-2'):
                            ui.icon('delete', size='sm').classes(f'text-{color}-600')
                            ui.label(zone).classes('text-sm font-bold')
                        ui.label(status).classes(f'text-xs font-bold text-{color}-600 bg-{color}-100 px-2 py-1 rounded')

        # 2. DIJKSTRA CONTROL (PDF Feature: Smart Routing)
        with ui.card().classes('w-full p-5 bg-gray-900 text-white shadow-xl rounded-xl'):
            ui.label('VRP Algorithm').classes('text-lg font-bold')
            ui.label('Optimize route to save fuel').classes('text-xs text-gray-400 mb-4')
            
            # Result Container
            results = ui.column().classes('w-full mt-2')
            
            async def run_dijkstra():
                results.clear()
                with results:
                    ui.spinner(size='md').classes('self-center text-green-500')
                
                await asyncio.sleep(1.0) # Calculation simulation
                path, dist, fuel, time = calculate_smart_route()
                
                results.clear()
                with results:
                    # Stats
                    with ui.row().classes('w-full gap-2 mb-3'):
                        for val, lbl, col in [(f'{dist}km', 'Dist', 'green'), (fuel, 'Fuel', 'blue'), (time, 'Time', 'orange')]:
                            with ui.column().classes(f'flex-1 bg-{col}-900/30 p-2 rounded items-center border border-{col}-500/30'):
                                ui.label(val).classes(f'text-{col}-400 font-bold text-lg')
                                ui.label(lbl).classes('text-[10px] text-gray-400 uppercase')
                    
                    # Visual Path
                    ui.label('Optimized Path (Full Bins Only):').classes('text-xs text-gray-400')
                    with ui.row().classes('flex-wrap gap-1 items-center'):
                        for i, node in enumerate(path):
                            ui.label(node).classes('bg-gray-700 px-2 py-1 rounded text-xs font-mono text-white')
                            if i < len(path) - 1:
                                ui.icon('arrow_forward', size='xs').classes('text-gray-500')

            ui.button('RUN DIJKSTRA', on_click=run_dijkstra).classes('w-full bg-green-600 hover:bg-green-700 font-bold text-white')

# --- 5. MAIN LAYOUT ---

@ui.page('/')
def main_page():
    # Mobile-first CSS
    ui.query('body').classes('bg-gray-200 p-0 m-0 overflow-hidden flex justify-center')
    
    # App Frame
    app = ui.column().classes('w-full max-w-md h-screen bg-gray-50 overflow-y-auto pb-28 relative shadow-2xl')
    
    def nav(view):
        app.clear()
        with app:
            if view == 'citizen': citizen_view()
            elif view == 'market': market_view()
            elif view == 'logistics': logistics_view()

    # Floating Navbar (Apple Style)
    with ui.footer().classes('bg-transparent p-0 justify-center pointer-events-none mb-6 fixed bottom-0 left-0 right-0 z-50'):
        with ui.element('div').classes('pointer-events-auto bg-white/95 backdrop-blur-xl border border-gray-200 rounded-full shadow-2xl px-6 py-3 flex gap-8 items-center'):
            def nav_btn(icon, view):
                ui.button(icon=icon, on_click=lambda: nav(view)).props('flat round size=lg').classes('text-green-800 hover:bg-green-50 transition-colors')
            
            nav_btn('person', 'citizen')
            nav_btn('storefront', 'market')
            nav_btn('local_shipping', 'logistics')

    # Start
    nav('citizen')

ui.run(title='EcoSecure DZ | Ultimate', native=True, window_size=(400, 850))