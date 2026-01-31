const XLSX = require("xlsx");
const User = require('../models/user.model');

exports.importEmployeeFromExcel = async (req, res) => {
        try {
                const user = await User.findOne({ user_id: req.userId });
                if (!user) {
                        return sendError(res, 'User not found', 404);
                }
                const excelFile = req.files?.excelFile;
                if (!excelFile) {
                        return res.status(400).json({ error: "Excel file not provided" });
                }
                const workbook = XLSX.read(excelFile.data, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                let created = 0;
                let skipped = 0;
                for (const row of rows) {
                        try {
                                const appointmentObj = {
                                        name: row['name'],
                                        email: row['email'],
                                        departmentName: row['departmentName'],
                                        role_id: 4,
                                        Fixed_role_id: 4,
                                        created_by: req.userId || null
                                };
                                console.log("===============================", appointmentObj)
                                let findUser = await User.findOne(appointmentObj);
                                if (!findUser) {
                                        const createUser = await User.create(appointmentObj);
                                        created++;
                                }
                        } catch (err) {
                                console.log("Row error:", err);
                                skipped++;
                        }
                }
                return res.status(200).json({ message: "Employee  imported", created, skipped });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Internal server error" });
        }
};
