const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, farmSize, cropType, serviceType } = req.body;

    // Check if fields are filled
    if (!name || !email || !password) {
      return res.status(400).send("Name, email, and password are required");
    }

    // Does user exist?
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).send("Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role || "farmer",
      phone,
      address,
      farmSize: role === "farmer" ? farmSize : undefined,
      cropType: role === "farmer" ? cropType : undefined,
      serviceType: role === "provider" ? serviceType : undefined
    });
    
    await newUser.save();

    // Create JWT token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    // Don't return password
    const userSafe = { 
      id: newUser._id, 
      name: newUser.name, 
      email: newUser.email, 
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address,
      farmSize: newUser.farmSize,
      cropType: newUser.cropType,
      serviceType: newUser.serviceType
    };

    res.status(201).json({ 
      message: "User registered successfully!", 
      token, 
      user: userSafe 
    });
  } catch (error) {
    res.status(500).send("Error registering user: " + error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if fields are filled
    if (!email || !password) {
      return res.status(400).send("Email and password are required");
    }

    // Does user exist?
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid email or password");
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).send("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).send("Account is deactivated");
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    const userSafe = { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      phone: user.phone,
      address: user.address,
      farmSize: user.farmSize,
      cropType: user.cropType,
      serviceType: user.serviceType
    };
    
    res.json({ 
      message: "Login successful", 
      token, 
      user: userSafe 
    });
  } catch (error) {
    res.status(500).send("Login error: " + error.message);
  }
};

exports.getUsers = async (req, res) => {
  try {
    // Admin only
    if (req.user.role !== "admin") {
      return res.status(403).send("Admin access required");
    }
    
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).send("Error fetching users: " + error.message);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).send("User not found!");
    
    // Check authorization
    if (req.user.role !== "admin" && req.user.id !== user._id.toString()) {
      return res.status(403).send("Not authorized");
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).send("Error fetching user: " + error.message);
  }
};

exports.updateUsers = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    let user = await User.findById(id);
    if (!user) {
      return res.status(404).send("User not found!");
    }

    // Check authorization
    if (req.user.role !== "admin" && req.user.id !== user._id.toString()) {
      return res.status(403).send("Not authorized");
    }

    // Don't allow role change for non-admins
    if (req.user.role !== "admin" && updatedData.role) {
      delete updatedData.role;
    }

    // Hash password if being updated
    if (updatedData.password) {
      updatedData.password = await bcrypt.hash(updatedData.password, 10);
    }

    Object.assign(user, updatedData);
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: `User updated successfully`,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).send("Error updating user: " + error.message);
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Admin only
    if (req.user.role !== "admin") {
      return res.status(403).send("Admin access required");
    }
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send("User not found!");
    }
    
    res.status(200).json({
      message: `User deleted successfully`,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).send("Error deleting user: " + error.message);
  }
};