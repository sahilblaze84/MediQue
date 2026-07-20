# MediQueue AI -智能医院分诊与预约管理系统

AI-Powered Hospital Triage and Appointment Management System

**支持联合国可持续发展目标第3项 (SDG 3) - 良好健康与福祉**

## 🌟 项目概述

MediQueue AI 是一个基于人工智能的医院分诊和预约管理系统，通过AI分析患者症状，自动推荐合适的科室、分配优先级，并优化预约流程，减少等待时间，提高医院运营效率。

### 核心功能

- **AI症状分析**: 使用 OpenAI/Gemini AI 分析患者症状，推荐科室和优先级
- **智能分诊**: 根据症状严重程度自动分配优先级（紧急、高、中、低）
- **预约管理**: 自动匹配可用医生，预约最早可用时段
- **自动化工作流**: 通过 n8n 自动化整个流程
- **通知系统**: 自动发送邮件和短信确认及提醒
- **医生门户**: 医生可查看预约和AI生成的患者摘要

## 🏗️ 技术架构

### 后端
- **框架**: Express.js
- **数据库**: SQLite
- **AI服务**: OpenAI API (GPT-3.5-turbo)
- **通知**: Nodemailer (邮件), Twilio (短信)

### 前端
- **框架**: React + Vite
- **样式**: TailwindCSS
- **图标**: Lucide React
- **路由**: React Router DOM

### 自动化
- **工作流引擎**: n8n
- **功能**: 自动化预约流程、通知发送、数据存储

## 📋 系统要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- OpenAI API Key
- (可选) Gmail App Password (用于邮件通知)
- (可选) Twilio Account (用于短信通知)
- n8n (用于自动化工作流)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd MediQue
```

### 2. 后端设置

```bash
cd backend
npm install
```

#### 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_PATH=./database/medique.db
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

#### 初始化数据库

```bash
npm run init-db
```

#### 启动后端服务

```bash
npm run dev
```

后端将在 http://localhost:5000 运行

### 3. 前端设置

```bash
cd frontend
npm install
```

#### 启动前端服务

```bash
npm run dev
```

前端将在 http://localhost:3000 运行

### 4. n8n 工作流设置（可选）

#### 安装 n8n

```bash
npm install -g n8n
n8n start
```

#### 导入工作流

1. 打开 n8n 界面 (http://localhost:5678)
2. 点击 "Import from File"
3. 选择项目根目录的 `n8n-workflow.json`
4. 配置所需的凭据（SMTP, Twilio, SQLite）
5. 激活工作流

详细配置说明请参考 [n8n工作流指南](./n8n-workflow-guide.md)

## 📁 项目结构

```
MediQue/
├── backend/
│   ├── database/
│   │   ├── db.js              # 数据库连接
│   │   └── init.js            # 数据库初始化
│   ├── routes/
│   │   ├── appointments.js    # 预约路由
│   │   ├── departments.js    # 科室路由
│   │   ├── doctors.js        # 医生路由
│   │   └── symptoms.js       # 症状分析路由
│   ├── services/
│   │   ├── aiService.js      # AI分析服务
│   │   └── notificationService.js  # 通知服务
│   ├── .env.example          # 环境变量示例
│   ├── package.json          # 后端依赖
│   └── server.js             # 服务器入口
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppointmentBooking.jsx  # 预约页面
│   │   │   ├── DoctorDashboard.jsx     # 医生门户
│   │   │   ├── Home.jsx               # 首页
│   │   │   ├── Navbar.jsx             # 导航栏
│   │   │   └── SymptomForm.jsx        # 症状表单
│   │   ├── App.jsx            # 主应用组件
│   │   ├── main.jsx           # 入口文件
│   │   └── index.css          # 全局样式
│   ├── index.html             # HTML模板
│   ├── package.json           # 前端依赖
│   ├── tailwind.config.js     # Tailwind配置
│   └── vite.config.js         # Vite配置
├── n8n-workflow.json          # n8n工作流配置
├── n8n-workflow-guide.md      # n8n配置指南
└── README.md                  # 项目文档
```

## 🔌 API 端点

### 症状分析
- `POST /api/symptoms/analyze` - 分析症状并获取科室推荐
- `GET /api/symptoms/history/:patientId` - 获取患者症状历史

### 预约管理
- `POST /api/appointments` - 创建预约
- `GET /api/appointments` - 获取所有预约
- `GET /api/appointments/:id` - 获取特定预约
- `PATCH /api/appointments/:id/status` - 更新预约状态
- `GET /api/appointments/available/slots` - 获取可用时段

### 科室管理
- `GET /api/departments` - 获取所有科室
- `GET /api/departments/:id` - 获取特定科室
- `GET /api/departments/:id/doctors` - 获取科室下的医生

### 医生管理
- `GET /api/doctors` - 获取所有医生
- `GET /api/doctors/:id` - 获取特定医生
- `POST /api/doctors` - 创建医生
- `GET /api/doctors/:id/appointments` - 获取医生的预约

## 🎯 使用流程

### 患者流程

1. **症状提交**
   - 访问首页，点击"开始症状检查"
   - 填写个人信息
   - 选择症状（可从常见症状中选择或自定义）
   - 选择严重程度和持续时间
   - 提交进行AI分析

2. **查看分析结果**
   - AI推荐科室
   - 优先级分配
   - AI生成的医生摘要
   - 建议行动

3. **预约预约**
   - 系统自动推荐科室
   - 选择医生
   - 选择日期和时间
   - 确认预约

4. **接收通知**
   - 预约确认邮件和短信
   - 预约前24小时提醒

### 医生流程

1. **访问医生门户**
   - 查看所有预约
   - 按状态和优先级筛选
   - 搜索患者

2. **管理预约**
   - 确认预约
   - 完成预约
   - 取消预约

3. **查看患者信息**
   - AI生成的患者摘要
   - 症状详情
   - 联系信息

## 🔒 安全注意事项

⚠️ **重要免责声明**

- 本系统仅用于分诊和预约管理，**不进行疾病诊断或治疗建议**
- AI分析仅供参考，不能替代专业医疗诊断
- 紧急情况请立即拨打急救电话或前往急诊科
- 所有医疗决策应由专业医护人员做出

### 数据安全

- 患者数据存储在本地SQLite数据库
- 建议在生产环境使用加密数据库
- 实施适当的访问控制和身份验证
- 遵守当地医疗数据隐私法规（如HIPAA、GDPR）

## 🧪 测试

### 测试AI分析（无需API Key）

系统包含基于规则的备用分析系统，即使没有OpenAI API Key也能运行：

```bash
# 测试症状分析端点
curl -X POST http://localhost:5000/api/symptoms/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "headache"],
    "severity": "moderate",
    "duration": "2 days"
  }'
```

### 测试预约创建

```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "doctorId": 1,
    "departmentId": 1,
    "appointmentDate": "2024-01-15",
    "appointmentTime": "10:00",
    "priorityLevel": "Medium",
    "symptomsSummary": "fever, headache",
    "aiSummary": "Patient presents with fever and headache"
  }'
```

## 🛠️ 开发指南

### 添加新的科室

编辑 `backend/database/init.js`，在 `insertDefaultDepartments` 函数中添加：

```javascript
{ name: 'New Department', description: 'Department description' }
```

### 自定义AI提示词

编辑 `backend/services/aiService.js` 中的 `analyzeSymptoms` 函数，修改 `prompt` 变量。

### 添加新的优先级规则

编辑 `backend/services/aiService.js` 中的 `fallbackAnalysis` 函数。

### 自定义前端样式

编辑 `frontend/tailwind.config.js` 添加自定义颜色和主题。

## 📊 数据库模式

### departments
- id (INTEGER, PRIMARY KEY)
- name (TEXT, UNIQUE)
- description (TEXT)
- created_at (TIMESTAMP)

### doctors
- id (INTEGER, PRIMARY KEY)
- name (TEXT)
- email (TEXT, UNIQUE)
- phone (TEXT)
- department_id (INTEGER, FOREIGN KEY)
- specialization (TEXT)
- available_from (TEXT)
- available_to (TEXT)
- created_at (TIMESTAMP)

### patients
- id (INTEGER, PRIMARY KEY)
- name (TEXT)
- email (TEXT)
- phone (TEXT)
- date_of_birth (TEXT)
- created_at (TIMESTAMP)

### appointments
- id (INTEGER, PRIMARY KEY)
- patient_id (INTEGER, FOREIGN KEY)
- doctor_id (INTEGER, FOREIGN KEY)
- department_id (INTEGER, FOREIGN KEY)
- appointment_date (TEXT)
- appointment_time (TEXT)
- priority_level (TEXT)
- status (TEXT)
- symptoms_summary (TEXT)
- ai_summary (TEXT)
- created_at (TIMESTAMP)

### symptom_submissions
- id (INTEGER, PRIMARY KEY)
- patient_id (INTEGER, FOREIGN KEY)
- symptoms (TEXT)
- severity (TEXT)
- duration (TEXT)
- suggested_department (TEXT)
- priority_level (TEXT)
- ai_summary (TEXT)
- created_at (TIMESTAMP)

## 🌍 环境变量说明

| 变量名 | 说明 | 必需 |
|--------|------|------|
| PORT | 后端服务端口 | 否 |
| OPENAI_API_KEY | OpenAI API密钥 | 是（用于AI分析） |
| DATABASE_PATH | SQLite数据库路径 | 否 |
| EMAIL_HOST | SMTP服务器地址 | 否 |
| EMAIL_PORT | SMTP端口 | 否 |
| EMAIL_USER | 邮箱用户名 | 否 |
| EMAIL_PASSWORD | 邮箱密码/应用密码 | 否 |
| TWILIO_ACCOUNT_SID | Twilio账户SID | 否 |
| TWILIO_AUTH_TOKEN | Twilio认证令牌 | 否 |
| TWILIO_PHONE_NUMBER | Twilio电话号码 | 否 |

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件

## 🙏 致谢

- OpenAI - 提供AI分析能力
- n8n - 提供工作流自动化
- React - 前端框架
- Express.js - 后端框架
- TailwindCSS - 样式框架

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 创建 Issue
- 发送邮件至项目维护者

## 🎯 SDG 3 - 良好健康与福祉

本项目直接支持联合国可持续发展目标第3项：

- **减少等待时间**: 通过智能分诊优化患者流程
- **提高医疗可及性**: 简化预约流程
- **优化资源利用**: 帮助医院更有效地管理资源
- **改善患者体验**: 提供透明、高效的服务

---

**注意**: 本系统仅用于演示和教育目的。在生产环境中使用前，请确保符合所有适用的医疗法规和标准。
