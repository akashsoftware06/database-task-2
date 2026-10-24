
const express = require("express");
const mongoose = require("mongoose");
const Post = require("./models/Post");

const app = express();
const PORT = 5000;

// Middleware to read JSON data from requests.
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb://127.0.0.1:27017/databaseTask"
    );

    console.log("MongoDB Connected Successfully");

    // Start the server after MongoDB connects.
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
  }
};

// Test Route
app.get("/", (req, res) => {
  res.send("Database Task API is running");
});

// GET - Get All Posts
app.get("/getPosts", async (req, res) => {
  try {
    const posts = await Post.find();

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching posts",
      error: error.message,
    });
  }
});

// POST - Add a New Post
app.post("/addPosts", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (typeof title !== "string" || typeof content !== "string") {
      return res.status(400).json({
        message: "Title and content must be strings",
      });
    }

    const newPost = new Post({
      title,
      content,
    });

    // Save the post to MongoDB.
    const savedPost = await newPost.save();

    res.status(201).json({
      message: "Post added successfully",
      post: savedPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding post",
      error: error.message,
    });
  }
});

// DELETE - Delete a Post using its ID from the request body.
app.delete("/delPosts", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Please provide a valid post ID in the request body",
      });
    }

    // Find the post by ID and delete it from MongoDB.
    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json({
      message: "Post deleted successfully",
      deletedPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting post",
      error: error.message,
    });
  }
});

// PATCH - Update a Particular Post using its ID.
app.patch("/post/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    if (title === undefined && content === undefined) {
      return res.status(400).json({
        message: "Provide title or content to update",
      });
    }

    if (
      (title !== undefined && typeof title !== "string") ||
      (content !== undefined && typeof content !== "string")
    ) {
      return res.status(400).json({
        message: "Title and content must be strings",
      });
    }

    // Update the specified fields and return the updated post.
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $set: { ...(title !== undefined && { title }), ...(content !== undefined && { content }) } },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json({
      message: "Post updated successfully",
      updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating post",
      error: error.message,
    });
  }
});

// Connect to MongoDB and start the server.
connectDB();
