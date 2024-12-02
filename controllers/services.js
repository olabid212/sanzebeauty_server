const expressAsyncHandler = require('express-async-handler');
const Service = require('../models/Service');
const fs = require('fs');
const path = require('path');

// Controller to create a new service
const createService = expressAsyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({ success: false, message: "Name and description are required" });
    }

    const service = await Service.create({
        name,
        description,
        images: req.files ? req.files.map(file => file.path) : []
    });

    res.status(201).json({ success: true, data: service });
});

// Controller to update an existing service
const updateService = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    let service = await Service.findById(id);
    if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (name) service.name = name;
    if (description) service.description = description;

    if (req.files && req.files.length > 0) {
        service.images.forEach((filePath) => {
            const fullPath = path.join(__dirname, '../uploads', filePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        });
        service.images = req.files.map(file => file.path);
    }

    const updatedService = await service.save();
    res.status(200).json({ success: true, data: updatedService });
});

// Controller to get all services
const getAllServices = expressAsyncHandler(async (req, res) => {
    const services = await Service.find({});
    res.status(200).json({ success: true, data: services });
});

// Controller to get a single service by ID
const getSingleService = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, data: service });
});

// Controller to delete a service by ID
const deleteService = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the service by ID
    const service = await Service.findById(id);
    if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Optional: Delete associated image files from the server
    if (service.images && Array.isArray(service.images)) {
        service.images.forEach((filePath) => {
            const fullPath = path.join(__dirname, '../uploads', filePath);
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                } catch (err) {
                    console.error(`Error deleting file: ${fullPath}`, err);
                }
            }
        });
    }

    // Delete the service from the database
    await Service.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Service deleted successfully' });
});

module.exports = { createService, updateService, getAllServices, getSingleService, deleteService };
