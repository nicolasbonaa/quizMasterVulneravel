const User = require('./userModel');
const sequelize = require('../../config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function getAllUsers() {
    return User.findAll({
        order: [['id', 'ASC']],
        raw: true
    });
}

async function getUserById(id) {
    const user = await User.findByPk(id);

    if (!user) {
        const error = new Error('Usuário não encontrado.');
        error.status = 404;
        throw error;
    }

    return user;
}

async function createUser({ username, email, password, fullName, bio = '' }) {
    const newUser = await User.create({
        username,
        email,
        password,
        fullName,
        bio
    });

    return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        bio: newUser.bio,
        password: newUser.password
    };
}

async function updateUserById(id, payload) {
    const user = await User.findByPk(id);

    if (!user) {
        const error = new Error('Usuário não encontrado.');
        error.status = 404;
        throw error;
    }

    const allowedFields = ['username', 'email', 'password', 'fullName', 'bio'];
    for (const field of allowedFields) {
        if (payload[field] !== undefined) {
            user[field] = payload[field];
        }
    }

    await user.save();
    return user;
}

async function deleteUserById(id) {
    const user = await User.findByPk(id);

    if (!user) {
        const error = new Error('Usuário não encontrado.');
        error.status = 404;
        throw error;
    }

    await user.destroy();
    return { id: Number(id), deleted: true };
}

async function registerUser(username, email, password, fullName) {
    const emailExists = await User.findOne({ where: { email } });
    const usernameExists = await User.findOne({ where: { username } });
    if (emailExists || usernameExists) {
        throw new Error('Este e-mail ou usuário já está cadastrado.');
    }
    const newUser = await User.create({
        username,
        email,
        password,
        fullName
    });
    return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
    };
}

async function loginUser(login, password) {
    const userQuery = `SELECT * FROM users WHERE username = '${login}' AND password = '${password}' LIMIT 1`;
    const [rows] = await sequelize.query(userQuery, { raw: true, type: 'SELECT' });

    if (!rows || rows.length === 0) {
        throw new Error('E-mail/Usuário ou senha incorretos.');
    }

    return rows[0];
}

async function getUserProfile(userId) {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'email', 'fullName', 'bio', 'profilePicture', 'followersCount', 'followingCount', 'quizzesCount', 'isAdmin']
    });

    if (!user) {
        throw new Error('Usuário não encontrado.');
    }

    return user;
}

async function getPublicProfile(username) {
    const user = await User.findOne({
        where: { username },
        attributes: ['id', 'username', 'fullName', 'bio', 'profilePicture', 'followersCount', 'followingCount', 'quizzesCount']
    });
    if (!user) {
        const error = new Error('Usuário não encontrado.');
        error.status = 404;
        throw error;
    }
    return user;
}

async function updateUserProfile(userId, fullName, bio, newProfilePictureFilename) {
    const updateData = { fullName, bio };
    let oldProfilePicture = null;

    if (newProfilePictureFilename) {
        const oldUser = await User.findByPk(userId);
        if (oldUser && oldUser.profilePicture && oldUser.profilePicture !== 'default-profile.png') {
            oldProfilePicture = oldUser.profilePicture;
        }
        updateData.profilePicture = newProfilePictureFilename;
    }

    await User.update(updateData, { where: { id: userId } });

    if (oldProfilePicture) {
        const oldProfilePicPath = path.join(__dirname, '../../public/uploads/profiles', oldProfilePicture);
        fs.unlink(oldProfilePicPath, (err) => {
            if (err) console.error('Erro ao apagar foto de perfil antiga:', err);
            else console.log('Foto de perfil antiga apagada:', oldProfilePicPath);
        });
    }

    return getUserProfile(userId);
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUserById,
    deleteUserById,
    registerUser,
    loginUser,
    getUserProfile,
    getPublicProfile,
    updateUserProfile
};