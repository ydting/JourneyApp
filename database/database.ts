import * as SQLite from 'expo-sqlite';

// Initialize database properly with the new API
const database = SQLite.openDatabaseSync('travel_planner.db');

export const initDatabase = () => {
  try {
    // Create tables using the new sync API
    database.execSync(`
      CREATE TABLE IF NOT EXISTS TravelPlan (
        plan_id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_name TEXT NOT NULL,
        destination TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL
      );
    `);

    database.execSync(`
      CREATE TABLE IF NOT EXISTS Day (
        day_id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_id INTEGER NOT NULL,
        day_number INTEGER NOT NULL,
        FOREIGN KEY (plan_id) REFERENCES TravelPlan(plan_id) ON DELETE CASCADE
      );
    `);

    database.execSync(`
      CREATE TABLE IF NOT EXISTS Stop (
        stop_id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_id INTEGER NOT NULL,
        location_name TEXT NOT NULL,
        address TEXT,
        latitude REAL,
        longitude REAL,
        arrival_time TEXT,
        departure_time TEXT,
        notes TEXT,
        order_index INTEGER NOT NULL,
        media_urls TEXT
      );
    `);

    database.execSync(`
      CREATE TABLE IF NOT EXISTS Review (
        review_id INTEGER PRIMARY KEY AUTOINCREMENT,
        stop_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (stop_id) REFERENCES Stop(stop_id) ON DELETE CASCADE
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Modern helper function - NO MORE TRANSACTIONS
const executeSql = (sql: string, params: any[] = []) => {
  try {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      // For SELECT queries, return all results
      return database.getAllSync(sql, params);
    } else {
      // For INSERT, UPDATE, DELETE queries
      return database.runSync(sql, params);
    }
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
};

// Travel Plan functions
export const addTravelPlan = async (plan_name: string, destination: string, start_date: string, end_date: string) => {
  try {
    const result = database.runSync(
      'INSERT INTO TravelPlan (plan_name, destination, start_date, end_date) VALUES (?, ?, ?, ?)',
      [plan_name, destination, start_date, end_date]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding travel plan:', error);
    throw error;
  }
};

export const getTravelPlans = async () => {
  try {
    const result = database.getAllSync('SELECT * FROM TravelPlan ORDER BY plan_id DESC');
    return result;
  } catch (error) {
    console.error('Error getting travel plans:', error);
    throw error;
  }
};

export const getTravelPlan = async (plan_id: number) => {
  try {
    const result = database.getFirstSync('SELECT * FROM TravelPlan WHERE plan_id = ?', [plan_id]);
    return result;
  } catch (error) {
    console.error('Error getting travel plan:', error);
    throw error;
  }
};

export const updateTravelPlan = async (plan_id: number, plan_name: string, destination: string, start_date: string, end_date: string) => {
  try {
    const result = database.runSync(
      'UPDATE TravelPlan SET plan_name = ?, destination = ?, start_date = ?, end_date = ? WHERE plan_id = ?',
      [plan_name, destination, start_date, end_date, plan_id]
    );
    return result.changes;
  } catch (error) {
    console.error('Error updating travel plan:', error);
    throw error;
  }
};

export const deleteTravelPlan = async (plan_id: number) => {
  try {
    const result = database.runSync(
      'DELETE FROM TravelPlan WHERE plan_id = ?',
      [plan_id]
    );
    return result.changes;
  } catch (error) {
    console.error('Error deleting travel plan:', error);
    throw error;
  }
};

// Day functions
export const addDay = async (plan_id: number, day_number: number) => {
  try {
    const result = database.runSync(
      'INSERT INTO Day (plan_id, day_number) VALUES (?, ?)',
      [plan_id, day_number]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding day:', error);
    throw error;
  }
};

export const getDaysForPlan = async (plan_id: number) => {
  try {
    const result = database.getAllSync(
      'SELECT * FROM Day WHERE plan_id = ? ORDER BY day_number ASC',
      [plan_id]
    );
    return result;
  } catch (error) {
    console.error('Error getting days for plan:', error);
    throw error;
  }
};

export const getDay = async (day_id: number) => {
  try {
    const result = database.getFirstSync(
      'SELECT * FROM Day WHERE day_id = ?',
      [day_id]
    );
    return result;
  } catch (error) {
    console.error('Error getting day:', error);
    throw error;
  }
};

export const updateDay = async (day_id: number, day_number: number) => {
  try {
    const result = database.runSync(
      'UPDATE Day SET day_number = ? WHERE day_id = ?',
      [day_number, day_id]
    );
    return result.changes;
  } catch (error) {
    console.error('Error updating day:', error);
    throw error;
  }
};

export const deleteDay = async (day_id: number) => {
  try {
    const result = database.runSync(
      'DELETE FROM Day WHERE day_id = ?',
      [day_id]
    );
    return result.changes;
  } catch (error) {
    console.error('Error deleting day:', error);
    throw error;
  }
};

// Stop functions
export const addStop = async (
  day_id: number, 
  location_name: string, 
  address: string = '', 
  latitude: number | null = null, 
  longitude: number | null = null, 
  arrival_time: string = '', 
  departure_time: string = '', 
  notes: string = '', 
  order_index: number, 
  media_urls: string = '[]'
) => {
  try {
    const result = database.runSync(
      'INSERT INTO Stop (day_id, location_name, address, latitude, longitude, arrival_time, departure_time, notes, order_index, media_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [day_id, location_name, address, latitude, longitude, arrival_time, departure_time, notes, order_index, media_urls]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding stop:', error);
    throw error;
  }
};

export const getStopsForDay = async (day_id: number) => {
  try {
    const result = database.getAllSync(
      'SELECT * FROM Stop WHERE day_id = ? ORDER BY order_index ASC',
      [day_id]
    );
    return result;
  } catch (error) {
    console.error('Error getting stops for day:', error);
    throw error;
  }
};

export const getStop = async (stop_id: number) => {
  try {
    const result = database.getFirstSync(
      'SELECT * FROM Stop WHERE stop_id = ?',
      [stop_id]
    );
    return result;
  } catch (error) {
    console.error('Error getting stop:', error);
    throw error;
  }
};

export const updateStop = async (
  stop_id: number, 
  location_name: string, 
  address: string = '', 
  latitude: number | null = null, 
  longitude: number | null = null, 
  arrival_time: string = '', 
  departure_time: string = '', 
  notes: string = '', 
  order_index: number, 
  media_urls: string = '[]'
) => {
  try {
    const result = database.runSync(
      'UPDATE Stop SET location_name = ?, address = ?, latitude = ?, longitude = ?, arrival_time = ?, departure_time = ?, notes = ?, order_index = ?, media_urls = ? WHERE stop_id = ?',
      [location_name, address, latitude, longitude, arrival_time, departure_time, notes, order_index, media_urls, stop_id]
    );
    return result.changes;
  } catch (error) {
    console.error('Error updating stop:', error);
    throw error;
  }
};

export const deleteStop = async (stop_id: number) => {
  try {
    const result = database.runSync(
      'DELETE FROM Stop WHERE stop_id = ?',
      [stop_id]
    );
    return result.changes;
  } catch (error) {
    console.error('Error deleting stop:', error);
    throw error;
  }
};

export const updateStopOrder = async (stop_id: number, new_order_index: number) => {
  try {
    const result = database.runSync(
      'UPDATE Stop SET order_index = ? WHERE stop_id = ?',
      [new_order_index, stop_id]
    );
    return result.changes;
  } catch (error) {
    console.error('Error updating stop order:', error);
    throw error;
  }
};

// Review functions
export const addReview = async (stop_id: number, rating: number, comment: string = '', timestamp: string) => {
  try {
    const result = database.runSync(
      'INSERT INTO Review (stop_id, rating, comment, timestamp) VALUES (?, ?, ?, ?)',
      [stop_id, rating, comment, timestamp]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const getReviewsForStop = async (stop_id: number) => {
  try {
    const result = database.getAllSync(
      'SELECT * FROM Review WHERE stop_id = ? ORDER BY timestamp DESC',
      [stop_id]
    );
    return result;
  } catch (error) {
    console.error('Error getting reviews for stop:', error);
    throw error;
  }
};

export const getReview = async (review_id: number) => {
  try {
    const result = database.getFirstSync(
      'SELECT * FROM Review WHERE review_id = ?',
      [review_id]
    );
    return result;
  } catch (error) {
    console.error('Error getting review:', error);
    throw error;
  }
};

export const updateReview = async (review_id: number, rating: number, comment: string = '', timestamp: string) => {
  try {
    const result = database.runSync(
      'UPDATE Review SET rating = ?, comment = ?, timestamp = ? WHERE review_id = ?',
      [rating, comment, timestamp, review_id]
    );
    return result.changes;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (review_id: number) => {
  try {
    const result = database.runSync(
      'DELETE FROM Review WHERE review_id = ?',
      [review_id]
    );
    return result.changes;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Helper function to get travel plan with all related data
export const getTravelPlanWithDetails = async (plan_id: number) => {
  try {
    const plan = await getTravelPlan(plan_id);
    if (!plan) return null;

    const days = await getDaysForPlan(plan_id);
    const daysWithStops = await Promise.all(
      days.map(async (day: any) => {
        const stops = await getStopsForDay(day.day_id);
        return { ...day, stops };
      })
    );

    return { ...plan, days: daysWithStops };
  } catch (error) {
    console.error('Error getting travel plan with details:', error);
    throw error;
  }
};

// Helper function to reorder stops
export const reorderStops = async (day_id: number, stopIds: number[]) => {
  try {
    // Update order_index for each stop
    await Promise.all(
      stopIds.map((stopId, index) => 
        updateStopOrder(stopId, index + 1)
      )
    );
    return true;
  } catch (error) {
    console.error('Error reordering stops:', error);
    throw error;
  }
};