# Quick Start Guide - Enhanced Reporting System

## Prerequisites
- Python 3.8+ installed
- Node.js 14+ and npm installed
- Backend dependencies installed
- Frontend dependencies installed

## Step 1: Install Dependencies (if needed)

### Backend
```bash
cd backend
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Start the Application

### Terminal 1 - Backend (uvicorn terminal)
```bash
cd backend
python -m uvicorn main:app --reload
```
The backend should start at: http://localhost:8000

### Terminal 2 - Frontend (node terminal)
```bash
cd frontend
ng serve
```
The frontend should start at: http://localhost:4200

## Step 3: Access the Reporting System

1. **Login as Admin**:
   - Navigate to: http://localhost:4200
   - Login with admin credentials
   - You should be redirected to the Admin Dashboard

2. **Open Reports**:
   - On the Admin Dashboard, locate the "Reports" card (pink/rose color with chart icon)
   - Click on the "Reports" card

3. **Generate a Report**:
   - A modal will open showing 6 report types
   - Click on any report card (e.g., "Users Overview")
   - The selected card will highlight in color with a checkmark

4. **View Charts** (Optional):
   - Click the "View Charts" button to see visualizations
   - (Note: This feature loads chart data from the API)

5. **Download Excel Report**:
   - Click the "Download Excel" button
   - The Excel file will automatically download
   - Open the file to see formatted data with multiple sheets

## Report Types Available

1. **Users Overview** (Blue)
   - User distribution by role
   - Registration trends
   - Trainer statistics

2. **Training Performance** (Green)
   - Training completion rates
   - Popular trainings
   - Department/skill breakdown

3. **Feedback Analysis** (Amber)
   - Feedback submission rates
   - Response trends
   - Top trainings by feedback

4. **Skills Gap Analysis** (Purple)
   - Skills with gaps
   - Expertise level distribution
   - Department-wise gaps

5. **System Analytics** (Cyan)
   - System usage patterns
   - Request/submission trends
   - Activity metrics

6. **Complete Report** (Rose)
   - All data in one Excel file
   - Multiple sheets (Users, Trainings, Feedback, Skills)

## Testing the Endpoints Directly

You can test the API endpoints using:

### Using Browser
Navigate to: http://localhost:8000/docs
- Interactive API documentation (Swagger UI)
- Test endpoints directly
- See request/response schemas

### Using curl (Example)
```bash
# Get user overview report (requires admin token)
curl -H "Authorization: Bearer <your-admin-token>" \
     http://localhost:8000/reports/users-overview

# Download Excel report
curl -H "Authorization: Bearer <your-admin-token>" \
     -o report.xlsx \
     "http://localhost:8000/reports/export/excel?report_type=users"
```

## Troubleshooting

### Backend Issues

**Issue**: Import errors for fastapi, sqlalchemy, etc.
**Solution**: Make sure you're in the backend directory and run:
```bash
pip install -r requirements.txt
```

**Issue**: Database connection errors
**Solution**: Check if the database file exists and is accessible

**Issue**: ModuleNotFoundError: No module named 'app'
**Solution**: This is already handled in main.py with sys.path.append()

### Frontend Issues

**Issue**: Module not found errors
**Solution**: 
```bash
cd frontend
npm install
```

**Issue**: Can't connect to backend
**Solution**: 
- Verify backend is running on http://localhost:8000
- Check environment.ts has correct apiUrl
- Check browser console for CORS errors

**Issue**: Report modal doesn't open
**Solution**: 
- Check browser console for JavaScript errors
- Verify you're logged in as admin
- Clear browser cache and refresh

**Issue**: Excel download doesn't start
**Solution**: 
- Check Network tab in browser DevTools
- Verify admin authentication token is valid
- Check backend terminal for error messages

## Verification Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 4200
- [ ] Can login as admin
- [ ] Admin Dashboard loads
- [ ] Reports card is visible
- [ ] Modal opens when clicking Reports
- [ ] All 6 report types are visible
- [ ] Can select a report type
- [ ] Excel download works
- [ ] Downloaded Excel file opens correctly
- [ ] Excel file has formatted data

## Expected File Output

When you download a report, you should see:
- File name: `SkillOrbit_Report_<type>_<timestamp>.xlsx`
- Example: `SkillOrbit_Report_users_20250119_143052.xlsx`

The Excel file should have:
- **Formatted headers**: Bold, colored backgrounds
- **Auto-adjusted columns**: Readable width
- **Multiple sheets**: For "all" report type
- **Professional styling**: Colors, borders, alignment

## Additional Notes

- Reports use real-time data from the database
- No caching - always fresh data
- Large reports may take a few seconds to generate
- Excel files work with Microsoft Excel, LibreOffice, Google Sheets
- All endpoints require admin authentication

## Support

If you encounter issues:
1. Check both terminal outputs for errors
2. Review browser console (F12)
3. Check Network tab for failed requests
4. Verify API documentation at http://localhost:8000/docs
5. Refer to REPORTING_IMPLEMENTATION.md for detailed information
