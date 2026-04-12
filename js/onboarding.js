// js/onboarding.js
// Handles onboarding form, pdf generation via jspdf, and email sending via emailjs

document.addEventListener("DOMContentLoaded", () => {
    const onboardingForm = document.getElementById('onboarding-form');
    const generateBtn = document.getElementById('generate-btn');
    const successState = document.getElementById('success-state');
    const loader = document.querySelector('.loader');
    const btnTxt = document.querySelector('.btn-txt');

    if(!onboardingForm) return;

    // IMPORTANT: To make this system fully production ready, you MUST initialize EmailJS.
    // Replace 'YOUR_PUBLIC_KEY', 'YOUR_SERVICE_ID', and 'YOUR_TEMPLATE_ID'.
    // emailjs.init("YOUR_PUBLIC_KEY");

    onboardingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        btnTxt.style.display = 'none';
        loader.style.display = 'inline-block';
        generateBtn.disabled = true;

        const formData = new FormData(onboardingForm);
        const data = Object.fromEntries(formData);
        
        try {
            // 1. Generate PDF (returns base64 string AND triggers download)
            const pdfBase64 = await generateAgreementDocument(data);
            
            // 2. Send via FormSubmit or equivalent
            await sendEmail(data, pdfBase64);

            // 3. Show Success State with Glowing UI payload
            onboardingForm.style.display = 'none';
            successState.style.display = 'block';
            document.querySelector('.modal-content').classList.add('success-glow-wave');

            // 4. Trigger WebGL Particle Payoff Animation
            if (typeof window.triggerSuccessParticles === 'function') {
                window.triggerSuccessParticles();
            }

        } catch(error) {
            console.error("Workflow failed:", error);
            alert("There was an error generating your agreement. Please try again or contact us.");
        } finally {
            // Restore btn
            btnTxt.style.display = 'inline-block';
            loader.style.display = 'none';
            generateBtn.disabled = false;
        }
    });

    async function generateAgreementDocument(data) {
        // Use jsPDF from window
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // --- COLORS & STYLES ---
        const primaryColor = [0, 240, 255]; // Cyan
        const darkColor = [3, 3, 3];
        const slateColor = [138, 143, 152];
        
        // --- HEADER LOGO ---
        // VReach_Logo.jpeg is loaded via canvas
        try {
            const logoDataURL = await getBase64ImageFromUrl('VReach_Logo.jpeg');
            if(logoDataURL) {
                // Placing logo
                doc.addImage(logoDataURL, 'JPEG', 14, 15, 30, 30);
            }
        } catch(e) {
            // If image fails, fallback to text
            doc.setFontSize(22);
            doc.setTextColor(...primaryColor);
            doc.text("VReach", 14, 25);
        }

        // --- TITLE ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(...darkColor);
        doc.text("Project Agreement & Confirmation", 14, 60);

        // --- DATE ---
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...slateColor);
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.text(`Generated on: ${today}`, 14, 68);

        // --- LINE SEPARATOR ---
        doc.setDrawColor(0, 240, 255);
        doc.setLineWidth(1);
        doc.line(14, 75, 196, 75);

        // --- CLIENT DETAILS ---
        doc.setFontSize(12);
        doc.setTextColor(...darkColor);
        doc.setFont("helvetica", "bold");
        doc.text("Client Information", 14, 90);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`Name: ${data.client_name}`, 14, 100);
        doc.text(`Business Name: ${data.business_name} (${data.business_type})`, 14, 108);
        doc.text(`Email: ${data.email}`, 14, 116);
        doc.text(`Phone: ${data.phone}`, 14, 124);
        if(data.links) doc.text(`Links: ${data.links}`, 14, 132);

        // --- PROJECT DETAILS ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Project Scope", 14, 150);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`Service: ${data.service}`, 14, 160);
        doc.text(`Start Date: ${data.start_date}`, 14, 168);
        
        let currencySymbol = data.currency === 'INR' ? 'Rs.' : '$';
        doc.text(`Agreed Quotation: ${currencySymbol} ${parseInt(data.quotation).toLocaleString()}`, 14, 176);

        // Word wrap for scope
        const splitScope = doc.splitTextToSize(`Scope / Details: ${data.scope}`, 180);
        doc.text(splitScope, 14, 184);

        let nextY = 184 + (splitScope.length * 7);

        // Versioning and Timestamps
        const exactTime = new Date().toLocaleTimeString('en-US');
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...darkColor);
        doc.text(`Agreement Version: 1.0`, 14, nextY + 10);
        doc.text(`Digital Timestamp: ${today} at ${exactTime}`, 14, nextY + 18);

        // Legal / Confirmation statement
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(...slateColor);
        doc.text("Signature: By submitting this form digitally, the client confirmed the accuracy of these details.", 14, nextY + 28);
        doc.text("Status: Verified & Submitted.", 14, nextY + 34);

        // POSITIVE CLOSING MESSAGE
        doc.setDrawColor(240, 240, 240);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(14, nextY + 45, 182, 40, 3, 3, 'FD'); // box
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0, 150, 160); // Darker cyan for text
        doc.text("Welcome aboard.", 20, nextY + 55);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...darkColor);
        const closingMsg = doc.splitTextToSize("Congratulations on taking the next step with VReach. We're excited to support your business growth and expand your digital reach with clarity, creativity, and measurable results.", 170);
        doc.text(closingMsg, 20, nextY + 65);

        // TRIGGER CLIENT DOWNLOAD
        // Trigger Client Download
        const fileName = `${data.business_name.replace(/\s+/g, '_')}_VReach_Agreement.pdf`;
        doc.save(fileName);

        // Get Blob for Email attachment instead of Base64
        const pdfBlob = doc.output('blob');
        return { blob: pdfBlob, fileName: fileName };
    }

    async function sendEmail(data, pdfData) {
        // Using FormSubmit.co - Zero accounts, zero API keys required.
        // It converts the submission directly into an email to this address.
        const targetEmail = "vreach666@gmail.com"; 

        const formData = new FormData();
        
        // FormSubmit Configuration
        // Note: It will ask you to confirm this email address the very first time a submission happens.
        formData.append("_subject", `New Deal Agreement: ${data.business_name}`);
        formData.append("_replyto", data.email);
        formData.append("_captcha", "false"); // Disable the visual captcha for a seamless UX
        formData.append("_template", "table"); // Makes the email look clean
        
        // Append all the data fields for the email body
        formData.append("Client Name", data.client_name);
        formData.append("Business Name", data.business_name);
        formData.append("Email", data.email);
        formData.append("Phone", data.phone);
        formData.append("Service", data.service);
        formData.append("Quotation", `${data.currency} ${data.quotation}`);
        
        // Append the generated PDF as an actual file attachment
        formData.append("Agreement_PDF", pdfData.blob, pdfData.fileName);

        try {
            const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const result = await response.json();
            console.log("Agreement dispatched successfully:", result);
        } catch (error) {
            console.error("FormSubmit Error:", error);
            throw error;
        }
    }

    // Helper: fetch an image URL and convert to Base64 so jsPDF can embed it
    function getBase64ImageFromUrl(imageUrl) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                let canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                let dataURL = canvas.toDataURL("image/jpeg");
                resolve(dataURL);
            };
            img.onerror = error => reject(error);
            img.src = imageUrl;
        });
    }
});
