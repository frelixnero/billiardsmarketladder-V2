# AI Agent Prompt: Convert Handoff Report to Premium MS Word (.docx)

Use the following detailed instructions to guide an AI agent or document generation tool in converting the `client_handoff_report.md` file into a polished, professional Word document.

---

### **System Role & Context**
You are an expert document design and typesetting assistant. Your goal is to convert the markdown text inside `client_handoff_report.md` into a premium, visually stunning MS Word (`.docx`) file. The target audience is the platform's client, operators, and potential league owners. The document must look professional, clean, and modern.

---

### **Design & Formatting Guidelines**

#### **1. Typography & Hierarchy**
*   **Font Family**: Use a clean, modern font pair like **Century Gothic / Aptos Display** (for Headings) and **Calibri / Aptos** (for Body text). Do not use Times New Roman.
*   **Title**: 26pt, Bold, Primary Theme Color, centered. Add a subtle divider line below it.
*   **Heading 1 (H1)**: 18pt, Bold, Primary Theme Color. Add a bottom border line (1.5pt thick) to separate sections.
*   **Heading 2 (H2)**: 14pt, Bold, Secondary Theme Color.
*   **Body Text**: 11pt, Regular, Dark Gray (#2B2B2B), 1.15 line spacing, with 6pt space after paragraphs.

#### **2. Color Palette (ActionLadder Theme)**
Apply a consistent, professional, color-coded style matching the platform's theme:
*   **Primary Theme Color (Deep Emerald)**: `#0F5132` (used for titles, major headers, and accent lines).
*   **Secondary Theme Color (Vibrant Green)**: `#198754` (used for highlight pills, subheadings, and positive stats).
*   **Alert/Warning Background**: `#FFF3CD` with a gold border `#FFC107` and dark gold text.
*   **Muted Text / Boarder Color**: `#6C757D` (used for borders, table lines, and metadata).
*   **Light Gray Background for Panels**: `#F8F9FA` (used for key takeaways, tables, and callouts).

#### **3. Callout Boxes & Panel Layouts**
*   Create visual callout boxes (panels) for key sections like **Executive Summary** and the **Roles table**.
*   A callout box should be a table with 1 cell, shaded light gray (`#F8F9FA`), with a thick left border (3pt) in the Primary Theme Color (`#0F5132`) and no other borders.
*   Indent bullet lists inside these panels slightly to create breathing room.

#### **4. Tables Styling**
*   Apply a custom design to the **Access Control System** table:
    *   **Header Row**: Shaded with Primary Theme Color (`#0F5132`), text in white, bold, and centered.
    *   **Data Rows**: Alternating zebra shading (Row 1 white, Row 2 light green `#E8F5E9` or light gray `#F8F9FA`).
    *   **Grid Lines**: Thin border lines in light gray (`#DEE2E6`). No heavy black borders.
    *   **Padding**: Add comfortable padding in table cells (at least 6pt top/bottom, 8pt left/right).

#### **5. Technical Diagram (Mermaid Rendering)**
*   Translate the Mermaid flowchart in the report into a clean, colored SmartArt graphic or nested shape layout in Word:
    *   Use colored boxes (Green/Gray) with white text.
    *   Connect the boxes with clean arrow lines showing the database state flow.

---

### **Document Structure & Flow**
1.  **Cover Header**: Center the document title, subtitle, and date.
2.  **Section 1: Executive Summary & Roles**:
    *   Include a short introduction.
    *   Format the **Onboarding & Access Control** table beautifully.
3.  **Section 2: Key Features & Client-Requested Adjustments**:
    *   For each of the 10 listed items, use bold inline lists or clean subheadings.
    *   Use green checkmarks (✅) for implementations.
4.  **Section 3: Technical Architecture**:
    *   Insert the flowchart layout.
    *   Explain the `app_state` JSON database configuration.
5.  **Section 4: Handoff Details**:
    *   Use a clean two-column grid or list showing the modified files and their remote repository path.

---

### **Execution Instructions**
*   Locate and parse the file `C:\Users\USER\.gemini\antigravity-ide\brain\0da1c5c1-cba7-45bd-bcbb-6aa65fba62aa\client_handoff_report.md`.
*   Generate the `.docx` file using Python's `python-docx` library or similar DOCX API, ensuring all styling rules, margins (1-inch all sides), and colors are applied.
*   Save the final document as `ActionLadder_Update_Report.docx` in the workspace directory: `C:\Users\USER\Desktop\upwork client\Billiards Market Ladder V2\ActionLadder_Update_Report.docx`.
