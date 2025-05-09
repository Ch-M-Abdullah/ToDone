# 📝 ToDone

**ToDone** is a side project, it is simply a Todo app with a little bit of added functionality built for Windows. It has some features that I thought I needed especially when programming. Maybe it is due to the brain rotting, but my focus has not been up to the mark lately, this is my way to help myself with that so I don't have to keep everything in mind.

---

## 🚀 Features

- 🔁 **Auto-Minimize on Mouse Leave**  
  When the mouse leaves the ToDone window, it automatically shrinks to a compact floating window—keeping your desktop clutter-free.
  ![Shrinking](https://github.com/user-attachments/assets/1a05371a-2ac2-4403-aa53-570d18b72fa6)

- 👆 **Restore on Hover**  
  Hover over the minimized window, and it smoothly expands back to full size so you can pick up where you left off.

- 🧠 **Nested Sub-Todos**  
  Double-click any Todo item to enter its detailed view. Create **unlimited layers of nested subtasks** to break down your bigger goals into manageable steps.
  ![Sub Todos](https://github.com/user-attachments/assets/e82a9999-4e1b-4099-9640-0716972705cb)


- 📂 **Organize with Hierarchies**  
  Keep your workflow clean by grouping subtasks under main tasks—ideal for complex projects like bug fixes, feature development, or study plans.

---

## ⚙️ Controls

- **Creating New Todo Item**
  > Ctrl + N

- **Creating a Sub-Todo Item**
  > Double Clicking a Todo Item OR Alt + RightArrow while keeping a Todo Item in focus.

- **Navigating Back**
  > Alt + LeftArrow

---

## 🖥️ Example Use Case

Imagine you have a task like:

> **Fix lagging bug in the frontend**

Double-click it, and you'll enter its sub-todo view. Now you can add items like:

- Find the function that is causing the lag
  - Check rendering loops
  - Inspect API response times
- Profile the performance in dev tools
- Optimize affected components

---

## 🛠 Tech Stack

- **Electron** (Desktop App Framework)
- **React**
