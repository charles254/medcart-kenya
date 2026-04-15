const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database', 'pharmacy.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Create blog_posts table
db.exec(`
  CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT,
      content TEXT NOT NULL,
      cover_image TEXT,
      author TEXT DEFAULT 'AfyaCart Team',
      category TEXT DEFAULT 'Health Tips',
      tags TEXT,
      published INTEGER DEFAULT 1,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
  CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published);
  CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);
`);

console.log('Blog tables created successfully.');

// Seed data
const posts = [
  {
    title: 'Understanding Over-the-Counter Pain Relief: Paracetamol vs Ibuprofen',
    slug: 'paracetamol-vs-ibuprofen-otc-pain-relief',
    excerpt: 'Learn the key differences between paracetamol and ibuprofen, when to use each, and important safety considerations for over-the-counter pain management.',
    content: `Pain is one of the most common reasons people visit a pharmacy. Whether it is a headache, muscle ache, or fever, reaching for an over-the-counter (OTC) pain reliever is often the first step. But how do you choose between paracetamol and ibuprofen? Understanding their differences can help you make the right decision.

Paracetamol, also known as acetaminophen, is one of the most widely used pain relievers in Kenya. It works by reducing the production of prostaglandins in the brain, which helps lower fever and relieve mild to moderate pain. Paracetamol is generally gentler on the stomach, making it suitable for people who experience digestive issues with other painkillers.

Ibuprofen belongs to a class of drugs called non-steroidal anti-inflammatory drugs (NSAIDs). Unlike paracetamol, ibuprofen not only relieves pain and reduces fever but also has anti-inflammatory properties. This makes it particularly effective for conditions involving inflammation, such as arthritis, menstrual cramps, and sports injuries.

When choosing between the two, consider the nature of your pain. For headaches, toothaches, and general fever, paracetamol is often sufficient. For pain accompanied by swelling or inflammation, ibuprofen may be more effective. However, ibuprofen should be taken with food to reduce the risk of stomach irritation.

It is important to note that both medications have maximum daily dosages. For adults, paracetamol should not exceed 4 grams per day, while ibuprofen should be limited to 1,200 milligrams for OTC use. Exceeding these limits can lead to serious health complications, including liver damage from paracetamol overdose.

Some people should avoid certain pain relievers entirely. Those with liver conditions should be cautious with paracetamol, while individuals with kidney problems, asthma, or stomach ulcers should avoid ibuprofen. Pregnant women should consult their doctor before taking either medication.

At AfyaCart, our pharmacists are always available to help you choose the right pain relief option. Never hesitate to ask for professional advice.

Disclaimer: This article is for informational purposes only. Always consult a healthcare professional before starting any medication.`,
    category: 'Medicine Guide',
    tags: 'pain relief;paracetamol;ibuprofen;OTC medicines;pharmacy',
    author: 'Dr. Pharmacy',
  },
  {
    title: '10 Essential Vitamins and Supplements for Everyday Health',
    slug: '10-essential-vitamins-supplements-everyday-health',
    excerpt: 'Discover the top vitamins and supplements that can support your daily health and wellbeing, from Vitamin D to probiotics.',
    content: `Good nutrition is the foundation of a healthy life, but even with a balanced diet, many people do not get all the essential nutrients they need. Vitamins and supplements can help fill these gaps. Here are ten essential supplements to consider for your daily health routine.

Vitamin D is crucial for bone health, immune function, and mood regulation. Many Kenyans assume they get enough from sunlight, but factors like indoor lifestyles and sunscreen use can limit production. A daily supplement of 1,000 to 2,000 IU is commonly recommended.

Vitamin C is a powerful antioxidant that supports immune function, skin health, and wound healing. While citrus fruits are great sources, a supplement can ensure you meet the recommended daily intake of 65 to 90 milligrams.

Omega-3 fatty acids are essential for heart health, brain function, and reducing inflammation. Fish oil supplements are the most common source, though plant-based alternatives from flaxseed or algae are also available.

Iron is vital for producing red blood cells and preventing anaemia, a condition that is particularly common among women and children in Kenya. Iron supplements should be taken with Vitamin C for better absorption.

B-Complex vitamins play essential roles in energy metabolism, nerve function, and red blood cell production. A B-complex supplement covers all eight B vitamins in one dose.

Zinc supports immune function, wound healing, and protein synthesis. It is especially important during cold and flu season. The recommended daily intake is 8 to 11 milligrams for adults.

Calcium is essential for strong bones and teeth, nerve signalling, and muscle function. Many adults do not consume enough dairy products, making supplementation important.

Probiotics support digestive health by maintaining a healthy balance of gut bacteria. They can help with bloating, irregular bowel movements, and may even support immune function.

Magnesium plays a role in over 300 enzymatic reactions in the body, including muscle and nerve function, blood sugar control, and blood pressure regulation.

Folic acid is especially important for women of childbearing age, as it helps prevent neural tube defects during pregnancy. It also supports cell growth and DNA formation.

Before starting any supplement regimen, consult with a healthcare professional to determine which supplements are right for you.

Disclaimer: This article is for informational purposes only. Always consult a healthcare professional before starting any medication.`,
    category: 'Nutrition',
    tags: 'vitamins;supplements;nutrition;health;wellness',
    author: 'AfyaCart Team',
  },
  {
    title: 'How to Build a Home First Aid Kit: A Complete Guide',
    slug: 'how-to-build-home-first-aid-kit-complete-guide',
    excerpt: 'Every home needs a well-stocked first aid kit. Learn what essential items to include and how to maintain your kit for emergencies.',
    content: `A well-stocked first aid kit is an essential item for every Kenyan household. Whether you are dealing with minor cuts, burns, or sudden illness, having the right supplies on hand can make a significant difference. Here is a comprehensive guide to building your home first aid kit.

Start with the basics. Adhesive bandages of various sizes are a must for covering small cuts and scrapes. Include sterile gauze pads and medical tape for larger wounds. An elastic bandage is useful for sprains and strains, while a triangular bandage can serve as a sling.

Antiseptic solutions are critical for cleaning wounds. Stock up on antiseptic wipes, hydrogen peroxide, or povidone-iodine solution. These help prevent infection when applied to cuts and abrasions. Antibiotic ointment can be applied after cleaning to further protect against infection.

Pain and fever management should be covered. Include paracetamol for adults and a children's formulation if you have young ones at home. An anti-inflammatory like ibuprofen is also useful. A digital thermometer is essential for monitoring fevers.

For allergic reactions, include antihistamine tablets and hydrocortisone cream. These can provide relief from insect bites, mild allergic reactions, and skin irritation. If anyone in your household has severe allergies, ensure you have their prescribed epinephrine auto-injector readily available.

Digestive aids are often overlooked but important. Oral rehydration salts (ORS) are vital for treating dehydration from diarrhoea or vomiting, which is particularly important in Kenya's climate. Anti-diarrhoeal medication and antacids should also be included.

Do not forget practical tools. Tweezers for removing splinters, small scissors for cutting tape and bandages, disposable gloves for hygiene, and a small torch for examining wounds in low light are all essential items.

Review and restock your first aid kit every six months. Check expiry dates on all medications and replace any used or expired items. Keep the kit in a cool, dry place that is easily accessible to adults but out of reach of children.

Disclaimer: This article is for informational purposes only. Always consult a healthcare professional before starting any medication.`,
    category: 'Health Tips',
    tags: 'first aid;emergency;home health;safety;medical supplies',
    author: 'AfyaCart Team',
  },
  {
    title: "Skin Care Routines for Kenya's Climate: Expert Tips",
    slug: 'skin-care-routines-kenya-climate-expert-tips',
    excerpt: "Kenya's diverse climate requires a tailored skin care approach. Discover expert tips for maintaining healthy, glowing skin in tropical and highland conditions.",
    content: `Kenya's climate ranges from the hot, humid coast to the cool highlands of Nairobi and beyond. Each environment presents unique challenges for your skin. Developing a skincare routine that accounts for your specific climate can help maintain healthy, radiant skin throughout the year.

For those living in hot and humid areas like Mombasa, excess oil production and sweat can clog pores and lead to breakouts. Use a gentle, water-based cleanser twice daily to remove impurities without stripping natural oils. A lightweight, oil-free moisturiser with SPF protection is essential even on cloudy days, as UV radiation remains strong near the equator.

In cooler highland areas like Nairobi, the dry air can leave skin feeling tight and flaky. A richer moisturiser containing hyaluronic acid or glycerin helps retain moisture. Consider adding a hydrating serum to your routine for an extra boost of hydration, especially during the cooler months.

Sun protection is non-negotiable in Kenya. The country sits on the equator, meaning UV exposure is consistently high throughout the year. Apply a broad-spectrum sunscreen with at least SPF 30 every morning, and reapply every two hours if you are outdoors. Look for sunscreens formulated for darker skin tones that do not leave a white cast.

Exfoliation is important for removing dead skin cells and promoting cell turnover. Use a gentle chemical exfoliant containing AHAs or BHAs two to three times a week. Avoid harsh physical scrubs, which can cause micro-tears in the skin and lead to irritation.

Hydration starts from within. Drink at least eight glasses of water daily and include water-rich foods in your diet, such as watermelon, cucumbers, and oranges. This internal hydration works alongside your topical products to keep skin plump and healthy.

Night-time is when your skin repairs itself. After cleansing, apply a nourishing night cream or facial oil. Ingredients like retinol, niacinamide, and vitamin E can help address specific concerns such as hyperpigmentation, fine lines, and uneven skin tone.

Visit your local AfyaCart pharmacy for personalised skincare recommendations. Our team can help you find products suited to your skin type and climate.

Disclaimer: This article is for informational purposes only. Always consult a healthcare professional before starting any medication.`,
    category: 'Skin Care',
    tags: 'skin care;beauty;sunscreen;moisturiser;Kenya climate',
    author: 'AfyaCart Team',
  },
  {
    title: 'Managing Diabetes: Diet, Exercise, and Medication Tips',
    slug: 'managing-diabetes-diet-exercise-medication-tips',
    excerpt: 'Living with diabetes requires careful management. Learn practical tips for maintaining blood sugar levels through diet, exercise, and proper medication use.',
    content: `Diabetes is a growing health concern in Kenya, affecting an estimated 3.3 percent of the adult population. Whether you have been recently diagnosed or have been managing the condition for years, understanding how to control your blood sugar through diet, exercise, and medication is essential for a healthy life.

Diet plays a fundamental role in diabetes management. Focus on eating regular, balanced meals that include complex carbohydrates, lean proteins, and healthy fats. Complex carbohydrates found in whole grains, sweet potatoes, and legumes are digested more slowly, causing a gradual rise in blood sugar rather than a sudden spike.

Portion control is equally important. Using a smaller plate can help manage serving sizes. The plate method is a simple approach: fill half your plate with non-starchy vegetables, a quarter with lean protein, and a quarter with complex carbohydrates. This ensures a balanced meal without complicated calorie counting.

Regular physical activity helps your body use insulin more effectively. Aim for at least 150 minutes of moderate-intensity exercise per week, such as brisk walking, swimming, or cycling. Even short walks after meals can help lower blood sugar levels. Always check your blood sugar before and after exercise, and carry a snack in case of low blood sugar.

Medication adherence is critical for diabetes management. Take your prescribed medications at the same time each day. If you are on insulin, learn proper injection techniques and storage requirements. Never adjust your medication dosage without consulting your healthcare provider.

Regular monitoring of blood sugar levels helps you understand how food, activity, and medication affect your body. Keep a log of your readings to share with your doctor during check-ups. Home glucose monitors are available at AfyaCart pharmacies.

Foot care is often overlooked but essential for people with diabetes. Check your feet daily for cuts, blisters, or sores. Keep them clean and moisturised, and wear comfortable, well-fitting shoes. Nerve damage from diabetes can reduce sensation in the feet, making injuries easy to miss.

Regular medical check-ups, including eye exams and kidney function tests, help catch complications early. Work closely with your healthcare team to develop a management plan that works for your lifestyle.

Disclaimer: This article is for informational purposes only. Always consult a healthcare professional before starting any medication.`,
    category: 'Wellness',
    tags: 'diabetes;blood sugar;diet;exercise;medication;chronic disease',
    author: 'Dr. Pharmacy',
  },
  {
    title: "A Parent's Guide to Common Childhood Illnesses in Kenya",
    slug: 'parents-guide-common-childhood-illnesses-kenya',
    excerpt: "From malaria to respiratory infections, learn how to recognise, treat, and prevent the most common childhood illnesses affecting children in Kenya.",
    content: `As a parent in Kenya, understanding common childhood illnesses can help you respond quickly and effectively when your child falls ill. While some conditions are minor and can be managed at home, others require prompt medical attention. Here is a guide to the most common childhood illnesses and how to handle them.

Upper respiratory tract infections, including the common cold and flu, are the most frequent childhood illnesses. Symptoms include a runny nose, cough, sore throat, and mild fever. Most cases resolve on their own within a week. Keep your child comfortable with plenty of fluids and rest. Use age-appropriate paracetamol for fever management. Seek medical help if symptoms worsen or the fever persists beyond three days.

Diarrhoeal diseases remain a significant concern in Kenya. They can be caused by viruses, bacteria, or parasites and can lead to dangerous dehydration, especially in young children. Start oral rehydration therapy immediately using ORS packets mixed with clean water. Continue feeding your child and breastfeeding if applicable. Seek medical attention if diarrhoea is severe, bloody, or accompanied by high fever.

Malaria continues to affect many parts of Kenya, particularly in the lake region and coastal areas. Symptoms include high fever, chills, headache, and body aches. If you suspect malaria, seek immediate medical testing and treatment. Prevention includes using insecticide-treated mosquito nets, wearing long sleeves in the evening, and using approved insect repellents.

Skin infections, including ringworm and impetigo, are common among school-age children. These are usually spread through direct contact. Keep your child's skin clean and dry, avoid sharing towels and clothing, and treat infections promptly with antifungal or antibiotic creams as recommended by a healthcare provider.

Ear infections often follow a cold or respiratory infection. Watch for signs such as ear pulling, irritability, difficulty sleeping, and fever. Mild cases may resolve on their own, but persistent or severe ear infections require antibiotic treatment prescribed by a doctor.

Keeping your child's vaccinations up to date is one of the most effective ways to prevent serious illnesses. Follow the Kenya Expanded Programme on Immunisation schedule and maintain a vaccination record card.

AfyaCart pharmacies stock a wide range of child-friendly medications, from flavoured paracetamol syrups to ORS sachets. Our pharmacists can advise on appropriate dosing and treatment options.

Disclaimer: This article is for informational purposes only. Always consult a healthcare professional before starting any medication.`,
    category: 'Baby Care',
    tags: 'children;childhood illness;malaria;diarrhoea;parenting;vaccination',
    author: 'Dr. Pharmacy',
  },
  {
    title: 'The Importance of Staying Hydrated: Water and Electrolytes',
    slug: 'importance-staying-hydrated-water-electrolytes',
    excerpt: "Proper hydration is essential for every body function. Learn how much water you really need, signs of dehydration, and when to use electrolyte supplements.",
    content: `Water is essential for life, yet many people do not drink enough throughout the day. Proper hydration supports nearly every function in the human body, from regulating temperature to supporting digestion and cognitive function. Understanding your hydration needs is a fundamental aspect of maintaining good health.

The human body is approximately 60 percent water. Every cell, tissue, and organ depends on water to function properly. Water helps transport nutrients, flush waste products, cushion joints, and maintain blood pressure. Even mild dehydration of just one to two percent of body weight can affect physical performance and mental clarity.

How much water do you actually need? While the common advice of eight glasses a day is a reasonable starting point, individual needs vary. Factors such as body size, physical activity level, climate, and overall health all play a role. In Kenya's warm climate, especially during hot seasons, you may need significantly more than the standard recommendation.

Recognising the signs of dehydration is important. Early symptoms include thirst, dry mouth, dark yellow urine, fatigue, and headache. More severe dehydration can cause dizziness, rapid heartbeat, confusion, and fainting. Children and elderly people are particularly vulnerable and may not recognise thirst cues.

Electrolytes are minerals that carry an electric charge and are essential for various bodily functions. Sodium, potassium, calcium, and magnesium are the key electrolytes. They help regulate nerve and muscle function, maintain fluid balance, and support bone health. When you sweat, you lose both water and electrolytes.

During intense physical activity, hot weather, or illness involving vomiting or diarrhoea, plain water may not be enough. Oral rehydration solutions containing the right balance of water, salts, and sugar are the most effective way to rehydrate. These are readily available at AfyaCart pharmacies in convenient sachet form.

Sports drinks can be useful for athletes engaging in prolonged exercise but often contain excessive sugar. For everyday hydration, water remains the best choice. You can enhance your water intake by eating water-rich foods such as watermelon, oranges, cucumbers, and spinach.

Make hydration a habit by carrying a reusable water bottle, setting reminders to drink throughout the day, and starting each morning with a glass of water.

Disclaimer: This article is for informational purposes only. Always consult a healthcare professional before starting any medication.`,
    category: 'Lifestyle',
    tags: 'hydration;water;electrolytes;dehydration;health tips',
    author: 'AfyaCart Team',
  },
  {
    title: 'Understanding Prescription Medications: What You Need to Know',
    slug: 'understanding-prescription-medications-what-you-need-to-know',
    excerpt: 'Prescription medications require careful handling. Learn about proper usage, storage, potential side effects, and the importance of following your doctor\'s instructions.',
    content: `Prescription medications are powerful tools in managing health conditions, but they require careful handling and adherence to medical advice. Understanding how to use, store, and manage your prescriptions safely is essential for effective treatment and your overall wellbeing.

A prescription medication is any drug that requires a written order from a licensed healthcare provider. Unlike over-the-counter medicines, these drugs are regulated because they may have stronger effects, carry greater risks of side effects, or require specific dosing that must be tailored to the individual patient.

Always take your medication exactly as prescribed. This means following the correct dosage, timing, and duration of treatment. Completing a full course of antibiotics, for example, is crucial even if you start feeling better before the course is finished. Stopping early can lead to antibiotic resistance, making the infection harder to treat in the future.

Understanding potential side effects is important. Read the patient information leaflet that comes with your medication. Common side effects are usually mild and may include nausea, drowsiness, or headache. However, if you experience severe or unusual symptoms, contact your healthcare provider immediately. Never ignore allergic reactions such as rash, swelling, or difficulty breathing.

Drug interactions can occur when two or more medications affect each other's effectiveness. Always inform your doctor and pharmacist about all medications you are currently taking, including over-the-counter drugs, vitamins, and herbal supplements. Some foods and beverages can also interact with medications, so ask about any dietary restrictions.

Proper storage of medications is essential for maintaining their effectiveness. Most medications should be stored in a cool, dry place away from direct sunlight. Some may require refrigeration. Always check the storage instructions and never use medication past its expiry date. Keep all medications out of reach of children.

Never share your prescription medications with others, even if they appear to have similar symptoms. Medications are prescribed based on individual factors such as age, weight, medical history, and other medications being taken. What works safely for one person may be harmful to another.

At AfyaCart pharmacies, our qualified pharmacists are available to answer your questions about prescription medications, help you understand potential interactions, and provide guidance on proper usage and storage.

Disclaimer: This article is for informational purposes only. Always consult a healthcare professional before starting any medication.`,
    category: 'Medicine Guide',
    tags: 'prescription;medication;pharmacy;drug safety;side effects',
    author: 'Dr. Pharmacy',
  },
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO blog_posts (title, slug, excerpt, content, category, tags, author, published, views, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, datetime('now', ?))
`);

const insertMany = db.transaction((posts) => {
  posts.forEach((post, index) => {
    const views = Math.floor(Math.random() * 500) + 50;
    const daysAgo = `-${(posts.length - index) * 5} days`;
    insert.run(post.title, post.slug, post.excerpt, post.content, post.category, post.tags, post.author, views, daysAgo);
  });
});

insertMany(posts);

console.log(`Seeded ${posts.length} blog posts successfully.`);
db.close();
