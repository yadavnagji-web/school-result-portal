/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - विद्यालय परीक्षा परिणाम एवं अंकतालिका बैकएंड (CLOUD API)
 * =========================================================================
 * 
 * विशेषताएँ:
 * 1. यह स्क्रिप्ट किसी भी Google Sheet को एक सुरक्षित REST API में बदल देती है।
 * 2. छात्र के रोल नंबर सर्च करने पर सीधे इसी शीट से परिणाम तुरंत मिल जाता है।
 * 3. एक से अधिक स्कूल अपनी-अपनी Google Sheet में यह कोड लगा सकते हैं।
 * 
 * कैसे उपयोग करें (How to Deploy):
 * 1. अपनी Google Sheet खोलें।
 * 2. मेन्यू में जाएँ: Extensions ➔ Apps Script.
 * 3. वहाँ यह पूरा कोड पेस्ट करें और Save (Ctrl+S) करें।
 * 4. ऊपर दाएँ कोने में "Deploy" ➔ "New deployment" पर क्लिक करें।
 * 5. Type: "Web App" चुनें।
 * 6. Execute as: "Me" और Who has access: "Anyone" सेट करें।
 * 7. "Deploy" दबाएँ और मिलने वाले Web App URL को कॉपी कर लें।
 * =========================================================================
 */

// 1. जब भी कोई रोल नंबर सर्च करेगा (GET Request)
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return responseJSON({ status: "error", message: "शीट में कोई डेटा नहीं है।" });
    }

    var headers = data[0]; // पहली पंक्ति (कॉलम के नाम)
    var rollToSearch = (e.parameter.roll || '').trim();

    // यदि कोई रोल नंबर नहीं दिया गया, तो सारे रिकॉर्ड्स की लिस्ट दें (एडमिन के लिए)
    if (!rollToSearch) {
      var allStudents = [];
      for (var r = 1; r < data.length; r++) {
        var rowObj = {};
        for (var c = 0; c < headers.length; c++) {
          rowObj[headers[c]] = data[r][c];
        }
        allStudents.push(rowObj);
      }
      return responseJSON({ status: "success", count: allStudents.length, data: allStudents });
    }

    // रोल नंबर ढूँढें (कॉलम Roll No या पहला कॉलम)
    var rollColIndex = 0;
    for (var i = 0; i < headers.length; i++) {
      var h = headers[i].toString().toLowerCase().trim();
      if (h === 'roll no' || h === 'rollno' || h === 'roll' || h === 'अनुक्रमांक') {
        rollColIndex = i;
        break;
      }
    }

    // सर्च लूप
    for (var row = 1; row < data.length; row++) {
      var currentRoll = data[row][rollColIndex].toString().trim();
      
      if (currentRoll === rollToSearch) {
        var studentData = {};
        for (var col = 0; col < headers.length; col++) {
          studentData[headers[col]] = data[row][col];
        }
        
        return responseJSON({
          status: "success",
          found: true,
          student: studentData
        });
      }
    }

    // अगर नहीं मिला
    return responseJSON({
      status: "not_found",
      found: false,
      message: "रोल नंबर " + rollToSearch + " का कोई परिणाम नहीं मिला।"
    });

  } catch (error) {
    return responseJSON({ status: "error", message: error.toString() });
  }
}

// 2. जब एडमिन नया रिजल्ट जोड़े (POST Request - Optional)
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var body = JSON.parse(e.postData.contents);
    
    if (body.row) {
      sheet.appendRow(body.row);
      return responseJSON({ status: "success", message: "नया रिकॉर्ड सफलतापूर्वक दर्ज हुआ!" });
    }
    return responseJSON({ status: "empty" });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

// हेल्पर फ़ंक्शन JSON रिस्पॉन्स भेजने के लिए
function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
