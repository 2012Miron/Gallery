// Данный файл отвечает за манипуляции с базой данных
import Database from 'better-sqlite3';
import fs from 'fs';
import __dirname from './__dirname.js';

var db = new Database('db.sqlite');

db.exec(`CREATE TABLE IF NOT EXISTS pictures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT, author TEXT,
            path TEXT UNIQUE, category TEXT
        )`);
db.exec(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE
        )`);

db.exec(`CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE, password TEXT, admintype TEXT
        )`);

if (db.prepare('SELECT COUNT(*) as count FROM categories').get().count === 0) {
    db.prepare('INSERT INTO categories (name) VALUES (?)').run('Без категорії');
    db.prepare('INSERT INTO categories (name) VALUES (?)').run('Природа');
    db.prepare('INSERT INTO categories (name) VALUES (?)').run('Тварини');
    db.prepare('INSERT INTO categories (name) VALUES (?)').run('Техніка');
}
if (db.prepare('SELECT COUNT(*) as count FROM admins').get().count === 0) {
    db.prepare('INSERT INTO admins (name, password, admintype) VALUES (?, ?, ?)').run(
        'root', '1234567890', 'super');
}

function getOrderedPictures(order, filter) {
    let query = 'SELECT * FROM pictures';
    let params = [];
    if (filter !== 'none') {
        query += ' WHERE category = ?';
        params.push(filter);
    }
    if (order === 'random') {
        query += ' ORDER BY RANDOM()';
    } else if (order === 'alphabet') {
        query += ' ORDER BY name ASC';
    } else if (order === 'old') {
        query += ' ORDER BY id ASC';
    } else if (order === 'new') {
        query += ' ORDER BY id DESC';
    }
    return db.prepare(query).all(...params);
}
export function allData(data, dataType, resultType = 'option-list', filter = 'none', order = 'random') {
    let txt = ``;
    let stmt = db.prepare(`SELECT * FROM ${dataType} WHERE id = ?`);
    if ((dataType == 'pictures' && resultType == 'gallery')) {
        stmt = getOrderedPictures(order, filter);
        for (let i = 0; i <= stmt.length - 1; i++) {
            if (stmt[i].category == filter || filter == 'none') {
                txt += `
                <div class="gallery-item">
                    <a href="/${stmt[i].path}">
                        <img src="/${stmt[i].path}" alt="${stmt[i].name}">
                        <p>${stmt[i].name} - ${stmt[i].author}</p>
                    </a>
                </div>`;
            }
        }
    } else if (resultType == 'option-list') {
        for (let i = 1; i <= db.prepare(`SELECT * FROM ${dataType}`).all().length; i++) {
            txt += `<option value="${i}">${stmt.get(i).name}</option>
            `
        }
    } else if (resultType == 'list') {
        return db.prepare(`SELECT * FROM ${dataType}`).all();
    } else {
        txt = 'ERROR: Wrong input in function "allData"!';
        console.log(txt);
    }
    if (txt == '') {
        txt = 'Даних поки немає';
    }
    return data.replace(`{{ ${dataType.toUpperCase()} MUST BE HERE }}`, txt);
}

export function addData(data, dataType) {
    let stmt;
    let lastId = db.prepare(`SELECT * FROM ${dataType} WHERE id = ?`).get(db.prepare(`SELECT * FROM ${dataType}`).all().length).id;
    if (!lastId) {
        lastId = 0;
    }
    if (dataType == 'pictures') {
        stmt = db.prepare('INSERT INTO pictures (id, name, author, path, category) VALUES (?, ?, ?, ?, ?)');
        stmt.run(`${lastId + 1}`, data[0], data[1], data[2], data[3]);
    } else if (dataType == 'categories') {
        stmt = db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)');
        stmt.run(`${lastId + 1}`, data);
    } else if (dataType == 'admins') {
        db.prepare('INSERT INTO admins (id, name, password, admintype) VALUES (?, ?, ?, ?)').run(
            `${lastId + 1}`, data[0], data[1], data[2]
        );
    } else {
        console.log('ERROR: Wrong input in function "addData"!')
    }
}

export function updateData(newData, dataType, updateType, id) {
    if (dataType == 'pictures' && updateType == 'path') {
        let stmt = db.prepare(`SELECT * FROM ${dataType} WHERE id = ?`);
        fs.unlinkSync(__dirname + '/' + stmt.get(id).path);
    }
    let stmt = db.prepare(`UPDATE ${dataType} SET ${updateType} = ? WHERE id = ?`);
    stmt.run(newData, id);
}

export function getData(id, table, resultType = 'object', getBy = 'id') {
    let stmt = db.prepare(`SELECT * FROM ${table} WHERE ${getBy} = ?`);
    if (resultType == 'object') {
        return stmt.get(id);
    } else if (resultType == 'picture' && table == 'pictures') {
        return `
        <div class="gallery-item">
            <a href="/${stmt.get(id).path}">
                <img src="/${stmt.get(id).path}" alt="${stmt.get(id).name}">
                <p>${stmt.get(id).name} - ${stmt.get(id).author}</p>
            </a>
        </div>`
    } else {
        return 'ERROR: Wrong value of variable resultType in function getData!'
    }
}

export function deleteData(id, table, confirm = false) {
    if (confirm == false) {
        return 'Deleting canceled!';
    }
    if (table == 'pictures') {
        fs.unlinkSync(__dirname + '/' + db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id).path);
    }
    let stmt = db.prepare(`DELETE FROM ${table} WHERE id = ?`);
    stmt.run(id);
}