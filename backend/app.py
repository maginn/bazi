# backend/app.py
# 八字命理系统后端服务
# 启动命令: python app.py
# 访问地址: http://localhost:5001
# API地址: http://localhost:5001/api/*

from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import os

# 创建Flask应用实例
app = Flask(__name__)

# ===========================================
# 数据库配置
# ===========================================
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "bazi.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ===========================================
# JWT配置
# ===========================================
app.config['JWT_SECRET_KEY'] = 'your-super-secret-jwt-key-change-in-production'  # 生产环境请更换为强密码
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=24)  # Token有效期24小时

# ===========================================
# CORS配置 - 允许前端跨域访问
# ===========================================
CORS(app, 
     origins=[
         "http://localhost:3000",        # React开发服务器
         "http://127.0.0.1:3000",       # 本地IP访问
         "http://localhost:3001",       # 备用端口
         "http://127.0.0.1:3001"        # 备用本地IP
     ],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=True
)

# 初始化扩展
db = SQLAlchemy(app)
jwt = JWTManager(app)

# ===========================================
# 数据库模型
# ===========================================
class User(db.Model):
    """用户模型"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    nickname = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # 关系
    charts = db.relationship('BaziChart', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'

class BaziChart(db.Model):
    """八字命盘模型"""
    __tablename__ = 'bazi_charts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    month = db.Column(db.Integer, nullable=False)
    day = db.Column(db.Integer, nullable=False)
    hour = db.Column(db.Integer, nullable=False)
    year_pillar = db.Column(db.String(10), nullable=False)
    month_pillar = db.Column(db.String(10), nullable=False)
    day_pillar = db.Column(db.String(10), nullable=False)
    hour_pillar = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def __repr__(self):
        return f'<BaziChart {self.year}-{self.month}-{self.day}>'

# ===========================================
# 八字计算核心算法
# ===========================================
# 十天干
stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
# 十二地支
branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

def gregorian_to_jd(year, month, day):
    """公历转儒略日"""
    if month <= 2:
        year -= 1
        month += 12
    a = year // 100
    b = 2 - a + a // 4
    jd = int(365.25 * (year + 4716)) + int(30.6001 * (month + 1)) + day + b - 1524.5
    return jd

def get_day_pillar(year, month, day):
    """获取日柱"""
    jd = gregorian_to_jd(year, month, day)
    day_index = int(jd - 2415010.5) % 60
    stem_index = day_index % 10
    branch_index = day_index % 12
    return stems[stem_index] + ' ' + branches[branch_index], stem_index

def get_hour_branch(hour):
    """获取时支"""
    branch_index = (hour + 1) // 2 % 12
    return branches[branch_index]

def get_hour_stem(day_stem_index, hour_branch_index):
    """获取时干"""
    group = day_stem_index % 5
    zi_stem_index = (group * 2) % 10
    hour_stem_index = (zi_stem_index + hour_branch_index) % 10
    return stems[hour_stem_index]

def get_year_pillar(year, month, day):
    """获取年柱"""
    # 立春判断
    li_chun_day = 4 if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0) else 5
    if month < 2 or (month == 2 and day < li_chun_day):
        year -= 1
    stem_index = (year - 4) % 10
    branch_index = (year - 4) % 12
    return stems[stem_index] + ' ' + branches[branch_index], stem_index

def get_month_branch(month, day):
    """获取月支"""
    start_days = [0, 6, 5, 6, 5, 6, 7, 8, 8, 8, 8, 7, 6]
    if day < start_days[month]:
        bazi_month = month - 1
    else:
        bazi_month = month
    if bazi_month == 0:
        bazi_month = 12
    bazi_month_branches = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]
    branch_index = bazi_month_branches[bazi_month - 1]
    return branches[branch_index], branch_index

def get_month_stem(year_stem_index, month_branch_index):
    """获取月干"""
    group = year_stem_index % 5
    yin_stem_index = (group * 2 + 2) % 10
    stem_index = (yin_stem_index + (month_branch_index - 2)) % 10
    return stems[stem_index]

# ===========================================
# API路由
# ===========================================

# 健康检查接口
@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'status': 'healthy',
        'message': '八字命理系统后端服务运行正常',
        'timestamp': datetime.datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

# 八字计算接口（无需认证）
@app.route('/api/calculate', methods=['POST'])
def calculate_bazi():
    """八字计算API"""
    try:
        data = request.json
        
        # 参数验证
        required_fields = ['year', 'month', 'day', 'hour']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需参数: {field}'}), 400
        
        year = int(data['year'])
        month = int(data['month'])
        day = int(data['day'])
        hour = int(data['hour'])
        
        # 范围验证
        current_year = datetime.datetime.now().year
        if not (1900 <= year <= current_year):
            return jsonify({'error': f'年份必须在1900-{current_year}之间'}), 400
        if not (1 <= month <= 12):
            return jsonify({'error': '月份必须在1-12之间'}), 400
        if not (1 <= day <= 31):
            return jsonify({'error': '日期必须在1-31之间'}), 400
        if not (0 <= hour <= 23):
            return jsonify({'error': '小时必须在0-23之间'}), 400
        
        # 计算八字
        year_pillar, year_stem_index = get_year_pillar(year, month, day)
        month_branch, month_branch_index = get_month_branch(month, day)
        month_stem = get_month_stem(year_stem_index, month_branch_index)
        month_pillar = month_stem + ' ' + month_branch
        day_pillar, day_stem_index = get_day_pillar(year, month, day)
        hour_branch = get_hour_branch(hour)
        hour_branch_index = branches.index(hour_branch)
        hour_stem = get_hour_stem(day_stem_index, hour_branch_index)
        hour_pillar = hour_stem + ' ' + hour_branch
        
        return jsonify({
            'year_pillar': year_pillar,
            'month_pillar': month_pillar,
            'day_pillar': day_pillar,
            'hour_pillar': hour_pillar,
            'calculated_at': datetime.datetime.utcnow().isoformat()
        })
        
    except ValueError as e:
        return jsonify({'error': '输入数据格式错误'}), 400
    except Exception as e:
        return jsonify({'error': f'计算失败: {str(e)}'}), 500

# 用户注册接口
@app.route('/api/register', methods=['POST'])
def register():
    """用户注册API"""
    try:
        data = request.json
        
        # 参数验证
        required_fields = ['nickname', 'email', 'password', 'confirm_password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field}不能为空'}), 400
        
        nickname = data['nickname'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        confirm_password = data['confirm_password']
        
        # 密码确认
        if password != confirm_password:
            return jsonify({'error': '两次输入的密码不一致'}), 400
        
        # 密码长度验证
        if len(password) < 6:
            return jsonify({'error': '密码长度至少6位'}), 400
        
        # 检查用户是否已存在
        if User.query.filter_by(email=email).first():
            return jsonify({'error': '该邮箱已被注册'}), 400
        
        if User.query.filter_by(nickname=nickname).first():
            return jsonify({'error': '该昵称已被使用'}), 400
        
        # 创建新用户
        hashed_password = generate_password_hash(password)
        new_user = User(
            nickname=nickname,
            email=email,
            password_hash=hashed_password
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': '注册成功',
            'user': {
                'id': new_user.id,
                'nickname': new_user.nickname,
                'email': new_user.email
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'注册失败: {str(e)}'}), 500

# 用户登录接口
@app.route('/api/login', methods=['POST'])
def login():
    """用户登录API"""
    try:
        data = request.json
        
        # 参数验证
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': '邮箱和密码不能为空'}), 400
        
        email = data['email'].strip().lower()
        password = data['password']
        
        # 查找用户
        user = User.query.filter_by(email=email).first()
        print("========"+user.nickname)
        
        if user and check_password_hash(user.password_hash, password):
            # 生成JWT token
            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={
                    'nickname': user.nickname,
                    'email': user.email
                }
            )
            
            return jsonify({
                'access_token': access_token,
                'user': {
                    'id': user.id,
                    'nickname': user.nickname,
                    'email': user.email
                },
                'message': '登录成功'
            })
        
        return jsonify({'error': '邮箱或密码错误'}), 401
        
    except Exception as e:
        return jsonify({'error': f'登录失败: {str(e)}'}), 500

# 保存命盘接口（需要JWT认证）
@app.route('/api/save_chart', methods=['POST'])
@jwt_required()
def save_chart():
    """保存八字命盘API"""
    try:
        
        user_id = int(get_jwt_identity())
        data = request.json
       
      # 检查用户是否存在
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        print("当前用户: {user.nickname} (ID: {user.id})")
        
        
        # 参数验证
        required_fields = ['year', 'month', 'day', 'hour', 'year_pillar', 'month_pillar', 'day_pillar', 'hour_pillar']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需参数: {field}'}), 400
        
        

        # 创建新的命盘记录
        new_chart = BaziChart(
            user_id=user_id,
            year=int(data['year']),
            month=int(data['month']),
            day=int(data['day']),
            hour=int(data['hour']),
            year_pillar=data['year_pillar'],
            month_pillar=data['month_pillar'],
            day_pillar=data['day_pillar'],
            hour_pillar=data['hour_pillar']
        )
        
        db.session.add(new_chart)
        db.session.commit()
        
        return jsonify({
            'message': '命盘保存成功',
            'chart_id': new_chart.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'保存失败: {str(e)}'}), 500

# 获取用户命盘列表接口（需要JWT认证）
@app.route('/api/my_charts', methods=['GET'])
@jwt_required()
def my_charts():
    """获取用户命盘列表API"""
    try:
        
        # 获取用户ID
        user_id = int(get_jwt_identity())
        print(f"Debug: 获取用户命盘列表 - 用户ID: {user_id}")
        
        # 检查用户是否存在
        user = User.query.get(user_id)
        if not user:
            print(f"Debug: 用户不存在 - ID: {user_id}")
            return jsonify({'error': '用户不存在'}), 404
        
        print(f"Debug: 当前用户: {user.nickname} (ID: {user.id})")
        
        # 获取用户的所有命盘，按创建时间倒序
        charts = BaziChart.query.filter_by(user_id=user_id)\
            .order_by(BaziChart.created_at.desc())\
            .all()
        
        print(f"Debug: 找到 {len(charts)} 个命盘")
        
        # 格式化返回数据
        chart_list = [{
            'id': chart.id,
            'date': f"{chart.year}-{chart.month:02d}-{chart.day:02d} {chart.hour:02d}:00",
            'birth_info': f"{chart.year}年{chart.month}月{chart.day}日 {chart.hour}时",
            'pillars': f"{chart.year_pillar} | {chart.month_pillar} | {chart.day_pillar} | {chart.hour_pillar}",
            'year_pillar': chart.year_pillar,
            'month_pillar': chart.month_pillar,
            'day_pillar': chart.day_pillar,
            'hour_pillar': chart.hour_pillar,
            'created_at': chart.created_at.isoformat()
        } for chart in charts]
        
        return jsonify({
            'success': True,
            'data': chart_list
        })
        
    except Exception as e:
        print(f"Error: 获取命盘列表失败 - {str(e)}")
        return jsonify({
            'success': False,
            'error': f'获取数据失败: {str(e)}'
        }), 500

# 删除命盘接口（需要JWT认证）
@app.route('/api/charts/<int:chart_id>', methods=['DELETE'])
@jwt_required()
def delete_chart(chart_id):
    """删除命盘API"""
    try:
        user_id = int(get_jwt_identity())
        
        # 查找命盘
        chart = BaziChart.query.filter_by(id=chart_id, user_id=user_id).first()
        if not chart:
            return jsonify({'error': '命盘不存在或无权限删除'}), 404
        
        db.session.delete(chart)
        db.session.commit()
        
        return jsonify({'message': '命盘删除成功'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'删除失败: {str(e)}'}), 500

# JWT错误处理
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token已过期，请重新登录'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Token无效，请重新登录'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': '缺少认证Token'}), 401

# 全局错误处理
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': '接口不存在'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': '请求方法不允许'}), 405

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': '服务器内部错误'}), 500

# ===========================================
# 应用启动
# ===========================================
if __name__ == '__main__':
    # 创建数据库表
    with app.app_context():
        db.create_all()
        print("✅ 数据库初始化完成")
    
    print("🚀 八字命理系统后端启动中...")
    print("📍 服务地址: http://localhost:5001")
    print("📍 API地址: http://localhost:5001/api/")
    print("📍 健康检查: http://localhost:5001/api/health")
    print("🔧 开发模式: 已启用")
    print("🌐 CORS: 已配置 (允许 localhost:3000)")
    
    # 启动应用
    # host='0.0.0.0' 允许外部访问
    # port=5001 指定端口
    # debug=True 开启调试模式
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5001,
        threaded=True
    )