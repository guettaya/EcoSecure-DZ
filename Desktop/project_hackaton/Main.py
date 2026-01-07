from nicegui import ui
import asyncio
import math

# --- 1. إعدادات التصميم (CSS & CONFIG) ---
APP_CSS = """
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        body { 
            background-color: #e0e7ff; 
            font-family: 'Inter', sans-serif; 
            margin: 0; 
            display: flex;
            justify-content: center;
            min-height: 100vh;
        }
        .phone-frame {
            width: 100%;
            max-width: 414px;
            height: 100vh;
            background-color: #f8fafc;
            display: flex;
            flex-direction: column;
            position: relative;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        @media (min-width: 450px) {
            .phone-frame {
                height: 90vh;
                margin-top: 5vh;
                border-radius: 40px;
                border: 8px solid #1e293b;
                overflow: hidden;
            }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Animations */
        .fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        /* Enhanced pulse animation for exit button - more visible */
        .pulse-red { 
            animation: pulseRed 1.5s ease-in-out infinite; 
        }
        @keyframes pulseRed {
            0%, 100% { 
                box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.9),
                           0 0 20px rgba(239, 68, 68, 0.5);
                transform: scale(1);
            }
            50% { 
                box-shadow: 0 0 0 15px rgba(239, 68, 68, 0),
                           0 0 40px rgba(239, 68, 68, 0.3);
                transform: scale(1.05);
            }
        }
    </style>
"""

# حالة التطبيق
state = {
    'points': 2450,
    'tab': 'citizen',
    'market_filter': 'All',
    'map_visible': False,
    'optimized_path': None,
    'user': None,  # معلومات المستخدم
    'is_authenticated': False  # حالة تسجيل الدخول
}

# --- 2. البيانات (DATASETS) ---

# بيانات السوق (مع تفاصيل الجودة والنسبة)
market_items = [
    {
        'id': 1, 'title': 'Iron Tailings', 'loc': 'Gara Djebilet', 
        'qty': '500 Tons', 'price': 12000, 'type': 'MINING', 'color': 'red', 'icon': 'landscape',
        'purity': '65%', 'quality': 'Raw (Unprocessed)'
    },
    {
        'id': 2, 'title': 'Used Cooking Oil', 'loc': 'El-Aurassi', 
        'qty': '1000 L', 'price': 1500, 'type': 'ORGANIC', 'color': 'green', 'icon': 'water_drop',
        'purity': '98%', 'quality': 'Filtered (High Grade)'
    },
    {
        'id': 3, 'title': 'PET Plastic', 'loc': 'Setif Zone', 
        'qty': '200 Kg', 'price': 800, 'type': 'PLASTIC', 'color': 'blue', 'icon': 'recycling',
        'purity': '99.5%', 'quality': 'Premium Pellets'
    },
]

# إحداثيات المناطق (للخريطة)
locations = {
    'Depot':  (36.7525, 3.0420), 
    'Zone A': (36.7600, 3.0500),
    'Zone B': (36.7400, 3.0300),
    'Zone C': (36.7700, 3.0600),
    'Zone D': (36.7300, 3.0200)
}

# --- 3. الخوارزميات (ALGORITHMS) ---

def solve_tsp_visit_all():
    """
    Nearest Neighbor Algorithm to visit ALL nodes starting from Depot
    """
    unvisited = ['Zone A', 'Zone B', 'Zone C', 'Zone D']
    current_node = 'Depot'
    path = [current_node]
    path_names = [current_node]
    
    while unvisited:
        nearest = None
        min_dist = float('inf')
        curr_coords = locations[current_node]
        
        for candidate in unvisited:
            cand_coords = locations[candidate]
            # مسافة تقريبية (Euclidean)
            d = math.sqrt((cand_coords[0]-curr_coords[0])**2 + (cand_coords[1]-curr_coords[1])**2)
            if d < min_dist:
                min_dist = d
                nearest = candidate
        
        path.append(nearest)
        path_names.append(nearest)
        unvisited.remove(nearest)
        current_node = nearest

    # العودة للمستودع
    path.append('Depot')
    path_names.append('Depot')
    
    # تحويل الأسماء إلى إحداثيات للخريطة
    route_coords = [locations[p] for p in path]
    return path_names, route_coords

# --- 4. صفحات المصادقة (AUTHENTICATION PAGES) ---

def render_signin_page(refresh_callback):
    """واجهة تسجيل الدخول - الصفحة الأولى"""
    with ui.column().classes('w-full h-full p-8 bg-gradient-to-br from-emerald-50 to-teal-50 justify-center'):
        
        # شعار التطبيق
        with ui.column().classes('w-full items-center mb-12'):
            with ui.element('div').classes('w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-2xl mb-4'):
                ui.icon('eco', size='3rem').classes('text-white')
            ui.label('EcoSecure').classes('text-4xl font-black text-gray-800 mb-1')
            ui.label('Sign in to continue').classes('text-sm text-gray-500')
        
        # بطاقة تسجيل الدخول
        with ui.card().classes('w-full max-w-md rounded-3xl p-8 shadow-xl bg-white'):
            ui.label('Welcome Back').classes('text-2xl font-black text-gray-800 mb-6')
            
            # حقول الإدخال
            ui.label('Phone Number').classes('text-xs font-bold text-gray-600 uppercase tracking-wider mb-2')
            phone_input = ui.input(placeholder='0X XX XX XX XX').props('outlined dense type="tel"').classes('w-full mb-4')
            
            ui.label('Password').classes('text-xs font-bold text-gray-600 uppercase tracking-wider mb-2')
            password_input = ui.input(placeholder='Enter your password', password=True, password_toggle_button=True).props('outlined dense').classes('w-full mb-2')
            
            # رسالة الخطأ
            error_label = ui.label('').classes('text-red-500 text-sm mb-4 hidden')
            
            async def attempt_signin():
                phone = phone_input.value
                password = password_input.value
                
                # التحقق من الحقول
                if not phone or not password:
                    error_label.classes(remove='hidden')
                    error_label.set_text('Please fill all fields')
                    return
                
                # التحقق من أن الهاتف يحتوي على أرقام فقط
                phone_clean = phone.replace(' ', '').replace('-', '')
                if not phone_clean.isdigit():
                    error_label.classes(remove='hidden')
                    error_label.set_text('Phone number must contain only numbers')
                    return
                
                if len(phone_clean) < 10:
                    error_label.classes(remove='hidden')
                    error_label.set_text('Phone number must be at least 10 digits')
                    return
                
                btn_signin.props('loading')
                await asyncio.sleep(1)
                
                # محاكاة تسجيل الدخول - في التطبيق الحقيقي، استرجع الاسم من قاعدة البيانات
                # للتبسيط، نقبل أي رقم وكلمة مرور صحيحة
                state['user'] = {
                    'name': 'User',  # سيتم تحديثه من قاعدة البيانات
                    'phone': phone_clean
                }
                state['is_authenticated'] = True
                state['current_page'] = 'app'
                
                ui.notify('Signed in successfully!', type='positive', icon='login')
                refresh_callback()
            
            btn_signin = ui.button('SIGN IN', on_click=attempt_signin).classes('w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 font-black text-base shadow-lg mb-4')
            
            # خط فاصل
            with ui.row().classes('w-full items-center gap-3 my-4'):
                ui.element('div').classes('flex-1 h-px bg-gray-200')
                ui.label('OR').classes('text-xs text-gray-400 font-bold')
                ui.element('div').classes('flex-1 h-px bg-gray-200')
            
            # رابط التسجيل
            with ui.row().classes('w-full justify-center gap-1'):
                ui.label("Don't have an account?").classes('text-sm text-gray-600')
                ui.label('Create Account').classes('text-sm text-emerald-600 font-bold cursor-pointer hover:text-emerald-700').on('click', lambda: show_signup_page(refresh_callback))

def show_signup_page(refresh_callback):
    """صفحة التسجيل"""
    state['current_page'] = 'signup'
    refresh_callback()

def render_signup_page(refresh_callback):
    """واجهة التسجيل"""
    with ui.column().classes('w-full h-full p-8 bg-gradient-to-br from-emerald-50 to-teal-50 justify-center overflow-y-auto hide-scrollbar'):
        
        # زر العودة
        ui.button(icon='arrow_back', on_click=lambda: [state.update({'current_page': 'signin'}), refresh_callback()]).props('flat round').classes('text-gray-600 mb-4')
        
        # شعار التطبيق (أصغر)
        with ui.column().classes('w-full items-center mb-8'):
            with ui.element('div').classes('w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-xl mb-3'):
                ui.icon('eco', size='2rem').classes('text-white')
            ui.label('Create Account').classes('text-3xl font-black text-gray-800 mb-1')
            ui.label('Join EcoSecure today').classes('text-sm text-gray-500')
        
        # بطاقة التسجيل
        with ui.card().classes('w-full max-w-md rounded-3xl p-8 shadow-xl bg-white'):
            
            # حقول الإدخال
            ui.label('Full Name').classes('text-xs font-bold text-gray-600 uppercase tracking-wider mb-2')
            name_input = ui.input(placeholder='Enter your full name').props('outlined dense').classes('w-full mb-4')
            
            ui.label('Phone Number').classes('text-xs font-bold text-gray-600 uppercase tracking-wider mb-2')
            phone_input = ui.input(placeholder='0X XX XX XX XX').props('outlined dense type="tel"').classes('w-full mb-4')
            
            ui.label('Password').classes('text-xs font-bold text-gray-600 uppercase tracking-wider mb-2')
            password_input = ui.input(placeholder='Create a password (min 6 characters)', password=True, password_toggle_button=True).props('outlined dense').classes('w-full mb-4')
            
            ui.label('Confirm Password').classes('text-xs font-bold text-gray-600 uppercase tracking-wider mb-2')
            confirm_input = ui.input(placeholder='Confirm your password', password=True, password_toggle_button=True).props('outlined dense').classes('w-full mb-2')
            
            # رسالة الخطأ
            error_label = ui.label('').classes('text-red-500 text-sm mb-4 hidden')
            
            async def attempt_signup():
                name = name_input.value
                phone = phone_input.value
                password = password_input.value
                confirm = confirm_input.value
                
                # التحقق من الحقول
                if not name or not phone or not password or not confirm:
                    error_label.classes(remove='hidden')
                    error_label.set_text('Please fill all fields')
                    return
                
                # تنظيف رقم الهاتف والتحقق منه
                phone_clean = phone.replace(' ', '').replace('-', '')
                if not phone_clean.isdigit():
                    error_label.classes(remove='hidden')
                    error_label.set_text('Phone number must contain only numbers')
                    return
                
                if len(phone_clean) < 10:
                    error_label.classes(remove='hidden')
                    error_label.set_text('Phone number must be at least 10 digits')
                    return
                
                if password != confirm:
                    error_label.classes(remove='hidden')
                    error_label.set_text('Passwords do not match')
                    return
                
                if len(password) < 6:
                    error_label.classes(remove='hidden')
                    error_label.set_text('Password must be at least 6 characters')
                    return
                
                btn_signup.props('loading')
                await asyncio.sleep(1.5)
                
                # حفظ المستخدم بالاسم الصحيح
                state['user'] = {
                    'name': name,
                    'phone': phone_clean
                }
                state['is_authenticated'] = True
                state['current_page'] = 'app'
                
                ui.notify(f'Welcome, {name}!', type='positive', icon='celebration')
                refresh_callback()
            
            btn_signup = ui.button('CREATE ACCOUNT', on_click=attempt_signup).classes('w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 font-black text-base shadow-lg mb-4')
            
            # رابط تسجيل الدخول
            with ui.row().classes('w-full justify-center gap-1'):
                ui.label("Already have an account?").classes('text-sm text-gray-600')
                ui.label('Sign In').classes('text-sm text-emerald-600 font-bold cursor-pointer hover:text-emerald-700').on('click', lambda: [state.update({'current_page': 'signin'}), refresh_callback()])

# --- 5. النوافذ المنبثقة (DIALOGS) ---

def show_cinema_dialog(refresh_callback):
    with ui.dialog() as dialog, ui.card().classes('w-[320px] rounded-3xl p-0 overflow-hidden bg-gray-900'):
        # صورة سينمائية
        with ui.element('div').classes('h-40 w-full bg-gradient-to-b from-purple-700 to-indigo-900 relative flex items-center justify-center'):
            ui.icon('theaters', size='4rem').classes('text-white/20')
            ui.label('CINEMA TICKET').classes('text-2xl font-black text-white tracking-widest absolute')
            # زر إغلاق
            ui.icon('close', size='sm').on('click', dialog.close).classes('absolute top-4 right-4 text-white cursor-pointer hover:bg-white/20 rounded-full p-1')
        
        # التفاصيل
        with ui.column().classes('p-6 w-full items-center gap-3 bg-white rounded-t-3xl -mt-6'):
            ui.label('Standard Admission').classes('text-xs font-bold text-gray-400 uppercase tracking-widest')
            ui.label('Valid for Any Movie').classes('text-xl font-bold text-gray-800')
            
            # السعر
            with ui.row().classes('w-full border-2 border-dashed border-gray-200 rounded-xl p-3 justify-between items-center'):
                with ui.column().classes('gap-0'):
                    ui.label('PRICE').classes('text-[10px] font-bold text-gray-400')
                    ui.label('800 PTS').classes('text-2xl font-black text-purple-600')
                ui.icon('confirmation_number', size='lg').classes('text-gray-800')

            async def redeem():
                if state['points'] >= 800:
                    btn.props('loading')
                    await asyncio.sleep(1)
                    state['points'] -= 800
                    dialog.close()
                    ui.notify('Ticket Generated Successfully!', type='positive', icon='local_activity')
                    refresh_callback()
                else:
                    ui.notify(f"Need {800 - state['points']} more points!", type='negative')

            btn = ui.button('CONVERT COINS & GET TICKET', on_click=redeem).classes('w-full bg-gray-900 text-white rounded-xl h-12 shadow-xl font-bold')
    dialog.open()

def show_negotiation_dialog(item):
    with ui.dialog() as dialog, ui.card().classes('w-[320px] rounded-3xl p-5 bg-white shadow-xl'):
        with ui.row().classes('w-full justify-between items-center mb-2'):
            ui.label('Negotiate Price').classes('text-lg font-bold text-gray-800')
            ui.icon('close', size='sm').on('click', dialog.close).classes('cursor-pointer text-gray-400 hover:text-red-500')
        
        ui.label(item['title']).classes('text-sm text-gray-500 mb-4')
        ui.label('Market Price').classes('text-xs font-bold text-gray-400 uppercase tracking-wider mb-1')
        ui.label(f"{item['price']} DA").classes('text-3xl font-black text-gray-800 mb-4')
        
        ui.label('Your Offer').classes('text-xs font-bold text-gray-400 uppercase tracking-wider mb-1')
        
        # حقل الإدخال مع أزرار +100 و -100
        with ui.row().classes('w-full gap-2 items-center mb-2'):
            # زر -100 (أحمر) - يجب أن يكون أولاً
            def decrease_offer():
                current = offer_input.value if offer_input.value else item['price']
                offer_input.set_value(max(0, current - 100))
            
            ui.button('-100', on_click=decrease_offer).props('no-caps').classes('bg-red-500 hover:bg-red-600 text-white rounded-xl w-16 h-12 shadow-lg font-black text-sm')
            
            offer_input = ui.number(value=item['price'], step=100).classes('flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 text-xl font-bold text-gray-700')
            
            # زر +100 (أخضر) - يجب أن يكون أخيراً
            def increase_offer():
                current = offer_input.value if offer_input.value else item['price']
                offer_input.set_value(current + 100)
            
            ui.button('+100', on_click=increase_offer).props('no-caps').classes('bg-green-500 hover:bg-green-600 text-white rounded-xl w-16 h-12 shadow-lg font-black text-sm')
        
        ui.label('Message to Seller (Optional)').classes('text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 mt-4')
        msg_input = ui.textarea(placeholder='E.g. I can pick up today...').classes('w-full border-2 border-gray-200 rounded-xl p-3 text-sm')
        
        async def send_offer():
            btn.props('loading')
            await asyncio.sleep(1.5)
            dialog.close()
            ui.notify('Offer Submitted Successfully!', type='positive', icon='send')
        
        btn = ui.button('SUBMIT OFFER', on_click=send_offer).classes('w-full bg-gray-900 text-white rounded-xl h-12 font-bold mt-4')
    dialog.open()

def show_details_dialog(item):
    with ui.dialog() as dialog, ui.card().classes('w-[340px] rounded-3xl p-0 shadow-2xl overflow-hidden'):
        # Header (الأيقونة بالأعلى)
        with ui.element('div').classes(f'w-full h-32 bg-gradient-to-br from-{item["color"]}-500 to-{item["color"]}-700 flex items-center justify-center relative'):
            ui.icon(item['icon'], size='3rem').classes('text-white')
            ui.icon('close', size='sm').on('click', dialog.close).classes('absolute top-4 right-4 text-white cursor-pointer hover:bg-white/20 rounded-full p-1')
        
        # المحتوى
        with ui.column().classes('p-6 gap-3 bg-white'):
            ui.label(item['title']).classes('text-xl font-black text-gray-800')
            with ui.row().classes('gap-2'):
                ui.label(item['type']).classes(f'bg-{item["color"]}-100 text-{item["color"]}-700 px-3 py-1 rounded-full text-xs font-bold')
                ui.label(item['qty']).classes('bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold')
            
            # تفاصيل الجودة
            ui.element('div').classes('w-full border-t border-gray-100 my-3')
            with ui.row().classes('w-full justify-between'):
                ui.label('Purity').classes('text-xs text-gray-500 font-bold')
                ui.label(item['purity']).classes('text-sm font-black text-gray-800')
            with ui.row().classes('w-full justify-between'):
                ui.label('Quality').classes('text-xs text-gray-500 font-bold')
                ui.label(item['quality']).classes('text-sm font-black text-gray-800')
            with ui.row().classes('w-full justify-between'):
                ui.label('Location').classes('text-xs text-gray-500 font-bold')
                ui.label(item['loc']).classes('text-sm font-black text-gray-800')
            
            # السعر (أكثر وضوحاً)
            ui.element('div').classes('w-full border-t border-gray-100 my-3')
            ui.label('Total Price').classes('text-xs text-gray-400 uppercase tracking-wider')
            ui.label(f"{item['price']} DA").classes('text-4xl font-black text-gray-900')
    dialog.open()

def show_flexy_dialog(refresh_callback):
    with ui.dialog() as dialog, ui.card().classes('w-[320px] rounded-3xl p-5 shadow-xl'):
        with ui.row().classes('w-full justify-between items-center mb-4'):
            ui.label('Flexy Recharge').classes('text-lg font-bold text-gray-800')
            ui.icon('close', size='sm').on('click', dialog.close).classes('cursor-pointer text-gray-400 hover:text-red-500')
        
        ui.label('Select Amount').classes('text-xs font-bold text-gray-400 uppercase tracking-wider mb-2')
        # أسعار أعلى وأكثر واقعية
        amounts = [(1, 1500), (2, 3000), (5, 45000), (10, 10000)]
        selected = ui.number(value=500).classes('hidden')
        
        for amount, cost in amounts:
            with ui.row().on('click', lambda a=amount: selected.set_value(a)).classes('w-full bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 rounded-xl p-3 justify-between items-center cursor-pointer mb-2 transition-all'):
                with ui.column().classes('gap-0'):
                    ui.label(f"{amount} GO").classes('font-bold text-gray-800 text-lg')
                    ui.label('internet gift').classes('text-[10px] text-gray-400')
                ui.label(f"{cost} PTS").classes('text-sm font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full')
        
        async def redeem():
            cost_map = {500: 400, 1000: 750, 2000: 1400, 5000: 3200}
            cost = cost_map.get(int(selected.value), 400)
            if state['points'] >= cost:
                btn.props('loading')
                await asyncio.sleep(1)
                state['points'] -= cost
                dialog.close()
                ui.notify(f"Flexy {int(selected.value)} DA Sent!", type='positive', icon='phone_android')
                refresh_callback()
            else:
                ui.notify(f"Need {cost - state['points']} more points!", type='negative')
        
        btn = ui.button('CONFIRM PURCHASE', on_click=redeem).classes('w-full bg-gray-900 text-white rounded-xl h-12 font-bold mt-4')
    dialog.open()

def show_camera_permission(refresh_callback):
    with ui.dialog() as dialog, ui.card().classes('w-[320px] rounded-3xl p-6 shadow-xl'):
        ui.icon('camera_alt', size='3rem').classes('text-green-600 mx-auto mb-4')
        ui.label('Camera Access Required').classes('text-xl font-bold text-gray-800 text-center mb-2')
        ui.label('Allow camera access to scan waste items and earn points').classes('text-sm text-gray-500 text-center mb-6')
        
        with ui.row().classes('w-full gap-3'):
            ui.button('Cancel', on_click=dialog.close).props('outline').classes('flex-1 text-gray-500 rounded-xl h-10')
            ui.button('Allow', on_click=lambda: [dialog.close(), ui.notify('Feature coming soon!', type='info')]).classes('flex-1 bg-green-600 text-white rounded-xl h-10')
    dialog.open()

# --- 5. العناصر الثابتة (COMPONENTS) ---

def render_header(title, subtitle):
    """رأس الصفحة مع أيقونة واضحة في الأعلى"""
    with ui.row().classes('w-full p-6 pb-4 items-center justify-between bg-white'):
        with ui.column().classes('gap-0'):
            ui.label(subtitle).classes('text-xs font-bold text-gray-400 uppercase tracking-wider')
            # عرض اسم المستخدم إذا كان مسجلاً
            display_title = title
            if state.get('user') and 'Welcome' in title:
                display_title = f"Welcome, {state['user']['name']}"
            ui.label(display_title).classes('text-2xl font-black text-gray-800')
        
        # قائمة المستخدم
        with ui.button(icon='account_circle').props('flat round').classes('text-emerald-600').on('click', lambda: show_profile_menu()):
            pass

def show_profile_menu():
    """قائمة الملف الشخصي"""
    with ui.menu() as menu:
        with ui.column().classes('p-2 min-w-[200px]'):
            if state.get('user'):
                ui.label(state['user']['name']).classes('font-bold text-gray-800 px-3 py-2')
                ui.label(state['user']['phone']).classes('text-sm text-gray-500 px-3 pb-2')
                ui.separator()
            
            with ui.row().classes('w-full p-2 hover:bg-gray-100 rounded cursor-pointer items-center gap-2').on('click', lambda: logout()):
                ui.icon('logout', size='sm').classes('text-red-500')
                ui.label('Logout').classes('text-sm text-gray-700')
    menu.open()

def logout():
    """تسجيل الخروج"""
    state['user'] = None
    state['is_authenticated'] = False
    state['current_page'] = 'signin'
    state['points'] = 2450  # إعادة تعيين النقاط
    ui.notify('Logged out successfully', type='info')
    # إعادة تحميل الصفحة
    ui.run_javascript('window.location.reload()')

def render_bottom_nav(refresh_callback):
    """شريط التنقل السفلي"""
    with ui.element('div').classes('w-full bg-white rounded-3xl shadow-2xl p-4'):
        with ui.row().classes('w-full justify-around items-center'):
            def nav_click(target):
                state['tab'] = target
                refresh_callback()
            
            for view, icon in [('citizen', 'person'), ('market', 'storefront'), ('logistics', 'local_shipping')]:
                active = state['tab'] == view
                color = 'text-green-400' if active else 'text-gray-500'
                with ui.column().classes('items-center cursor-pointer').on('click', lambda v=view: nav_click(v)):
                    ui.icon(icon, size='sm').classes(f'{color} transition-colors duration-300')
                    if active: ui.element('div').classes('w-1 h-1 bg-green-400 rounded-full mt-1')

# --- 6. محتوى الصفحات (PAGES) ---

def render_citizen_page(refresh_callback):
    # بطاقة الرصيد
    with ui.element('div').classes('w-full h-48 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[32px] p-6 relative overflow-hidden shadow-xl mb-6'):
        ui.element('div').classes('absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl')
        ui.label('Balance').classes('text-emerald-100 text-xs font-medium')
        ui.label(f"{state['points']}").classes('text-5xl font-black text-white')
        ui.label('Eco-Points').classes('text-emerald-200 text-sm font-medium')

    # زر إضافة صورة (كبير وواضح)
    ui.label('Scan Waste').classes('text-lg font-bold text-gray-800 mb-2')
    with ui.button(on_click=lambda: show_camera_permission(refresh_callback)).classes('w-full h-24 bg-white border-2 border-dashed border-green-300 rounded-3xl flex flex-col items-center justify-center gap-2 mb-6 hover:bg-green-50'):
        with ui.row().classes('items-center gap-2'):
            ui.icon('add_a_photo', size='lg').classes('text-green-600')
            ui.label('Tap to Add Picture').classes('text-gray-500 text-sm font-bold')

    # المكافآت (تم إضافة السينما)
    ui.label('Rewards').classes('text-lg font-bold text-gray-800 mb-2')
    with ui.grid(columns=2).classes('w-full gap-3'):
        # Flexy
        with ui.element('div').on('click', lambda: show_flexy_dialog(refresh_callback)).classes('bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 cursor-pointer'):
            ui.icon('smartphone', size='md').classes('text-blue-600')
            ui.label('Flexy').classes('font-bold text-gray-700 text-sm')
        
        # Cinema
        with ui.element('div').on('click', lambda: show_cinema_dialog(refresh_callback)).classes('bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 cursor-pointer'):
            ui.icon('movie', size='md').classes('text-purple-600')
            ui.label('Cinema').classes('font-bold text-gray-700 text-sm')

def render_market_page(refresh_callback):
    # الفلاتر (تصميم جديد - كل الفئات واضحة دائماً)
    ui.label('Categories').classes('text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider')
    
    with ui.row().classes('w-full gap-2 mb-4 flex-wrap'):
        filters = [
            ('All', 'apps', 'gray'), 
            ('MINING', 'landscape', 'red'), 
            ('ORGANIC', 'water_drop', 'green'), 
            ('PLASTIC', 'recycling', 'blue')
        ]
        
        for f_name, f_icon, f_color in filters:
            active = state['market_filter'] == f_name
            
            # تصميم واضح لكل الفئات
            if active:
                # النشط: خلفية ملونة
                btn_class = f'bg-{f_color}-600 text-white shadow-xl border-2 border-{f_color}-700'
            else:
                # غير النشط: خلفية بيضاء مع أيقونة ملونة
                btn_class = f'bg-white text-{f_color}-600 border-2 border-{f_color}-200 hover:border-{f_color}-400'
            
            with ui.element('div').classes(f'{btn_class} px-5 py-3 rounded-2xl cursor-pointer transition-all duration-300 min-w-[90px]').on('click', lambda x=f_name: [state.update({'market_filter': x}), refresh_callback()]):
                with ui.column().classes('items-center gap-1 w-full'):
                    ui.icon(f_icon, size='sm').classes('font-bold')
                    ui.label(f_name).classes('text-[11px] font-black tracking-wide')

    # القائمة
    items = [i for i in market_items if state['market_filter'] == 'All' or i['type'] == state['market_filter']]
    for item in items:
        with ui.card().classes('w-full p-0 rounded-3xl shadow-sm border border-gray-100 mb-4'):
            with ui.row().classes('p-4 gap-4 items-center'):
                with ui.element('div').classes(f'w-16 h-16 rounded-2xl bg-{item["color"]}-50 flex items-center justify-center text-{item["color"]}-500'):
                    ui.icon(item['icon'], size='md')
                with ui.column().classes('flex-1 gap-1'):
                    ui.label(item['title']).classes('text-sm font-bold text-gray-800')
                    with ui.row().classes('gap-2 mt-1'):
                        ui.label(item['qty']).classes('bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600')
                        ui.label(item['type']).classes(f'bg-{item["color"]}-100 px-2 py-0.5 rounded text-[10px] font-bold text-{item["color"]}-700')
            
            with ui.row().classes('w-full border-t border-gray-100 p-0'):
                ui.button('Details', on_click=lambda i=item: show_details_dialog(i)).props('flat').classes('flex-1 text-gray-500 text-xs h-10 rounded-none')
                ui.button('NEGOTIATE', on_click=lambda i=item: show_negotiation_dialog(i)).classes('flex-1 bg-gray-900 text-white text-xs h-10 rounded-tl-xl rounded-br-3xl')

def render_logistics_page(refresh_callback):
    # البطاقة الرئيسية (الخريطة والتحكم) - حجم أكبر وأوضح
    with ui.card().classes('w-full bg-gray-900 text-white rounded-[32px] p-0 shadow-xl mb-6 overflow-hidden'):
        
        # أزرار التحكم - تظهر دائماً
        with ui.column().classes('p-6 gap-3'):
            with ui.row().classes('w-full justify-between items-center'):
                ui.label('Route Optimization').classes('text-xl font-black')
                status = 'Optimized' if state['map_visible'] else 'Ready'
                ui.label(status).classes('text-xs text-gray-300 bg-gray-800 px-3 py-1.5 rounded-full font-bold')

            async def run_optimizer():
                ui.notify('Calculating Shortest Path...', color='black', position='top')
                await asyncio.sleep(1.5)
                
                # حساب المسار لزيارة الجميع
                path_names, path_coords = solve_tsp_visit_all()
                state['optimized_path'] = path_coords
                state['map_visible'] = True
                
                refresh_callback() # تحديث الصفحة لإظهار الخريطة
                ui.notify(f"Optimal Path: {' -> '.join(path_names)}", type='positive')

            # زر أزرق بأيقونة الخريطة
            if not state['map_visible']:
                with ui.button(on_click=run_optimizer).classes('w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black h-14 shadow-lg text-base'):
                    with ui.row().classes('items-center justify-center gap-2'):
                        ui.icon('map', size='sm').classes('text-white')
                        ui.label('OPTIMIZE NOW').classes('font-black tracking-wider')
            else:
                with ui.button(on_click=run_optimizer).classes('w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black h-14 shadow-lg text-base'):
                    with ui.row().classes('items-center justify-center gap-2'):
                        ui.icon('refresh', size='sm').classes('text-white')
                        ui.label('RE-CALCULATE PATH').classes('font-black tracking-wider')
        
        # حاوية الخريطة (تظهر فقط عند التحسين)
        if state['map_visible']:
            with ui.element('div').classes('w-full h-96 bg-gray-800 relative fade-in'):
                # زر الرجوع في الأعلى اليمين (لتجنب التعارض)
                with ui.element('div').classes('absolute top-4 right-4 z-[1000]'):
                    def close_map():
                        state['map_visible'] = False
                        state['optimized_path'] = None
                        refresh_callback()
                    
                    with ui.button(on_click=close_map).classes('bg-white hover:bg-gray-100 text-gray-800 rounded-full w-12 h-12 shadow-2xl flex items-center justify-center border-2 border-gray-300'):
                        ui.icon('close', size='md').classes('text-gray-800 font-bold')
                
                m = ui.leaflet(center=(36.7525, 3.0420), zoom=13).classes('w-full h-full')
                # رسم العلامات
                for name, coords in locations.items():
                    m.marker(latlng=coords).props(f'title="{name}"')
                # رسم المسار (الأحمر)
                if state['optimized_path']:
                    m.polyline(state['optimized_path'], color='#ef4444', weight=4, opacity=0.9).run_method('bringToFront')
                
                # زر الخروج الأحمر في الأسفل
                with ui.element('div').classes('absolute bottom-4 left-0 right-0 flex justify-center z-[1000]'):
                    def close_map_bottom():
                        state['map_visible'] = False
                        state['optimized_path'] = None
                        refresh_callback()
                    
                    with ui.button(on_click=close_map_bottom).classes('bg-red-600 hover:bg-red-700 text-white rounded-2xl px-8 py-3 shadow-2xl font-black text-sm pulse-red border-4 border-white'):
                        with ui.row().classes('items-center gap-2'):
                            ui.icon('close_fullscreen', size='sm').classes('font-bold')
                            ui.label('EXIT MAP').classes('tracking-wider')

    # قائمة الحاويات
    ui.label('Containers (Must Visit All)').classes('text-lg font-bold text-gray-800 mb-2')
    for zone in ['Zone A', 'Zone B', 'Zone C', 'Zone D']:
        status = 'Pending' if not state['map_visible'] else 'Scheduled'
        icon_color = 'red' if not state['map_visible'] else 'green'
        
        with ui.row().classes('w-full bg-white p-3 rounded-2xl items-center justify-between border border-gray-100 mb-2'):
            with ui.row().classes('items-center gap-3'):
                ui.element('div').classes(f'w-3 h-3 rounded-full bg-{icon_color}-500')
                ui.label(zone).classes('font-bold text-sm text-gray-700')
            ui.label(status).classes(f'text-xs font-bold text-{icon_color}-600 bg-{icon_color}-50 px-3 py-1 rounded-full')

# --- 7. التشغيل الرئيسي (MAIN) ---

@ui.page('/')
def main_page():
    ui.add_head_html(APP_CSS)
    
    # تهيئة الصفحة الحالية - تسجيل الدخول أولاً
    if 'current_page' not in state:
        state['current_page'] = 'signin' if not state.get('is_authenticated') else 'app'
    
    with ui.element('div').classes('phone-frame'):
        
        main_container = ui.column().classes('w-full h-full')

        def refresh_ui():
            main_container.clear()
            
            with main_container:
                # عرض الصفحة المناسبة بناءً على حالة المصادقة
                if state.get('current_page') == 'signin' and not state.get('is_authenticated'):
                    render_signin_page(refresh_ui)
                
                elif state.get('current_page') == 'signup':
                    render_signup_page(refresh_ui)
                
                elif state.get('current_page') == 'app' and state.get('is_authenticated'):
                    # التطبيق الرئيسي
                    header_container = ui.column().classes('w-full z-10 p-0 m-0')
                    content_container = ui.column().classes('w-full flex-grow overflow-y-auto px-6 pb-28 hide-scrollbar')
                    footer_container = ui.element('div').classes('absolute bottom-6 left-0 right-0 px-6 z-20')
                    
                    with header_container:
                        header_text = {
                            'citizen': ('Welcome, Ahmed', 'EcoSecure'),
                            'market': ('Industrial Market', 'B2B Economy'),
                            'logistics': ('Smart Logistics', 'Route AI')
                        }
                        t, s = header_text[state['tab']]
                        render_header(t, s)

                    with content_container:
                        if state['tab'] == 'citizen': render_citizen_page(refresh_ui)
                        elif state['tab'] == 'market': render_market_page(refresh_ui)
                        elif state['tab'] == 'logistics': render_logistics_page(refresh_ui)

                    with footer_container:
                        render_bottom_nav(refresh_ui)
                else:
                    # إذا لم يكن مصادق، ارجع لصفحة تسجيل الدخول
                    state['current_page'] = 'signin'
                    render_signin_page(refresh_ui)

        refresh_ui()

ui.run(title='EcoSecure Ultimate', native=False, port=8080, reload=False)
