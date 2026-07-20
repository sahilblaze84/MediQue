const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || './database/medique.db';
const dbDir = path.dirname(dbPath);

// Create database directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables
const createTables = (db) => {
  return new Promise((resolve) => {
    db.serialize(() => {
      // Departments table
      db.run(`
        CREATE TABLE IF NOT EXISTS departments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Doctors table
      db.run(`
        CREATE TABLE IF NOT EXISTS doctors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          phone TEXT,
          department_id INTEGER,
          specialization TEXT,
          available_from TEXT,
          available_to TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (department_id) REFERENCES departments(id)
        )
      `);

      // Patients table
      db.run(`
        CREATE TABLE IF NOT EXISTS patients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT NOT NULL,
          date_of_birth TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Appointments table
      db.run(`
        CREATE TABLE IF NOT EXISTS appointments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          doctor_id INTEGER NOT NULL,
          department_id INTEGER NOT NULL,
          appointment_date TEXT NOT NULL,
          appointment_time TEXT NOT NULL,
          priority_level TEXT NOT NULL,
          status TEXT DEFAULT 'scheduled',
          symptoms_summary TEXT,
          ai_summary TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id),
          FOREIGN KEY (doctor_id) REFERENCES doctors(id),
          FOREIGN KEY (department_id) REFERENCES departments(id)
        )
      `);

      // Symptom submissions table
      db.run(`
        CREATE TABLE IF NOT EXISTS symptom_submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER,
          symptoms TEXT NOT NULL,
          severity TEXT,
          duration TEXT,
          suggested_department TEXT,
          priority_level TEXT,
          ai_summary TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
      `, () => {
        resolve();
      });
    });
  });
};

// Create indexes for better performance
const createIndexes = (db) => {
  db.serialize(() => {
    db.run('CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_appointments_department ON appointments(department_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date)');
    db.run('CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)');
    db.run('CREATE INDEX IF NOT EXISTS idx_appointments_priority ON appointments(priority_level)');
    db.run('CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(appointment_date, appointment_time)');
    
    db.run('CREATE INDEX IF NOT EXISTS idx_doctors_department ON doctors(department_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email)');
    
    db.run('CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone)');
    db.run('CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email)');
    
    db.run('CREATE INDEX IF NOT EXISTS idx_symptoms_patient ON symptom_submissions(patient_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_symptoms_created ON symptom_submissions(created_at)');
  });
};

// Insert default departments
const insertDefaultDepartments = (db) => {
  const departments = [
    { name: 'General Medicine', description: 'General health checkups and common illnesses' },
    { name: 'Orthopedics', description: 'Bone and joint related issues' },
    { name: 'Dermatology', description: 'Skin conditions and diseases' },
    { name: 'Cardiology', description: 'Heart and cardiovascular conditions' },
    { name: 'Neurology', description: 'Brain and nervous system disorders' },
    { name: 'Pediatrics', description: 'Child healthcare and diseases' },
    { name: 'Emergency', description: 'Emergency medical care' },
    { name: 'Gynecology', description: 'Women health and reproductive system' },
    { name: 'Ophthalmology', description: 'Eye care and vision problems' },
    { name: 'ENT', description: 'Ear, nose, and throat conditions' }
  ];

  db.serialize(() => {
    const insertDept = db.prepare('INSERT OR IGNORE INTO departments (name, description) VALUES (?, ?)');
    departments.forEach(dept => {
      insertDept.run(dept.name, dept.description);
    });
    insertDept.finalize();
  });
};

// Insert default doctors
const insertDefaultDoctors = (db) => {
  const doctors = [
    { name: 'Dr. John Smith', email: 'john.smith@medique.com', phone: '123-456-7890', department_id: 1, specialization: 'Family Medicine', available_from: '09:00', available_to: '17:00' },
    { name: 'Dr. Sarah Connor', email: 'sarah.connor@medique.com', phone: '123-456-7891', department_id: 2, specialization: 'Joint Replacement', available_from: '09:00', available_to: '17:00' },
    { name: 'Dr. Emily Davis', email: 'emily.davis@medique.com', phone: '123-456-7892', department_id: 3, specialization: 'Clinical Dermatology', available_from: '09:00', available_to: '17:00' },
    { name: 'Dr. Robert Chen', email: 'robert.chen@medique.com', phone: '123-456-7893', department_id: 4, specialization: 'Cardiology', available_from: '09:00', available_to: '17:00' },
    { name: 'Dr. James Wilson', email: 'james.wilson@medique.com', phone: '123-456-7894', department_id: 5, specialization: 'Clinical Neurology', available_from: '09:00', available_to: '17:00' },
    { name: 'Dr. Lisa House', email: 'lisa.house@medique.com', phone: '123-456-7895', department_id: 6, specialization: 'Pediatrics', available_from: '09:00', available_to: '17:00' },
    { name: 'Dr. Gregory Carter', email: 'gregory.carter@medique.com', phone: '123-456-7896', department_id: 7, specialization: 'Trauma Surgery', available_from: '09:00', available_to: '17:00' },
    { name: 'Dr. Maria Santos', email: 'maria.santos@medique.com', phone: '123-456-7897', department_id: 8, specialization: 'Gynecology & Obstetrics', available_from: '09:00', available_to: '17:00' },
    { name: 'Dr. Alan Grant', email: 'alan.grant@medique.com', phone: '123-456-7898', department_id: 9, specialization: 'Ophthalmology', available_from: '09:00', available_to: '17:00' },
    { name: 'Dr. Alice Vance', email: 'alice.vance@medique.com', phone: '123-456-7899', department_id: 10, specialization: 'Otolaryngology (ENT)', available_from: '09:00', available_to: '17:00' }
  ];

  db.serialize(() => {
    const insertDoc = db.prepare('INSERT OR IGNORE INTO doctors (name, email, phone, department_id, specialization, available_from, available_to) VALUES (?, ?, ?, ?, ?, ?, ?)');
    doctors.forEach(doc => {
      insertDoc.run(doc.name, doc.email, doc.phone, doc.department_id, doc.specialization, doc.available_from, doc.available_to);
    });
    insertDoc.finalize();
  });
};

const initializeDatabase = async (db) => {
  await createTables(db);
  createIndexes(db);
  insertDefaultDepartments(db);
  insertDefaultDoctors(db);
  console.log('[DB] Database tables and default data initialized');
};

// If run directly (npm run init-db), execute it on the default db
if (require.main === module) {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const fs = require('fs');

  const dbPath = process.env.DATABASE_PATH || './database/medique.db';
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database');
      await initializeDatabase(db);
      setTimeout(() => db.close(), 1000);
    }
  });
}

module.exports = { initializeDatabase };
