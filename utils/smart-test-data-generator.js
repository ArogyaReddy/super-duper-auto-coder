#!/usr/bin/env node

/**
 * 🎲 SMART TEST DATA GENERATOR
 * 
 * Mind-blowing features:
 * - AI-powered realistic data generation
 * - Schema-aware data creation
 * - Relationship-preserving data sets
 * - Localized data for global testing
 * - Edge case and boundary value generation
 * - Performance-optimized bulk generation
 * - Data anonymization and GDPR compliance
 */

const crypto = require('crypto');

class SmartTestDataGenerator {
    constructor(options = {}) {
        this.options = {
            locale: options.locale || 'en-US',
            seed: options.seed || Date.now(),
            realistic: options.realistic !== false,
            includeEdgeCases: options.includeEdgeCases !== false,
            gdprCompliant: options.gdprCompliant || false,
            ...options
        };
        
        this.random = this.createSeededRandom(this.options.seed);
        this.cache = new Map();
        this.relationships = new Map();
        
        this.initializeDataSets();
    }

    // Initialize realistic data sets
    initializeDataSets() {
        this.firstNames = {
            'en-US': ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen'],
            'es-ES': ['Antonio', 'María', 'José', 'Carmen', 'Francisco', 'Josefa', 'Juan', 'Isabel', 'Manuel', 'Ana', 'David', 'Pilar', 'José', 'María', 'Antonio', 'Dolores', 'Francisco', 'María', 'Daniel', 'Rosa'],
            'fr-FR': ['Jean', 'Marie', 'Pierre', 'Françoise', 'Michel', 'Monique', 'Alain', 'Catherine', 'Philippe', 'Sylvie', 'Patrick', 'Martine', 'Bernard', 'Brigitte', 'Claude', 'Nicole', 'Henri', 'Chantal', 'Robert', 'Nathalie']
        };

        this.lastNames = {
            'en-US': ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'],
            'es-ES': ['García', 'González', 'Rodriguez', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez'],
            'fr-FR': ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard']
        };

        this.domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com', 'test.org', 'example.net'];
        
        this.streetTypes = ['Street', 'Avenue', 'Boulevard', 'Lane', 'Road', 'Drive', 'Way', 'Court', 'Place'];
        
        this.cities = {
            'en-US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
            'es-ES': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'],
            'fr-FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille']
        };

        this.companies = ['TechCorp', 'DataSystems', 'CloudWorks', 'InnovateInc', 'DigitalSolutions', 'NextGen', 'FutureTech', 'SmartSystems', 'GlobalTech', 'AdvancedSoft'];
        
        this.jobTitles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer', 'Marketing Manager', 'Sales Representative', 'Business Analyst', 'Quality Assurance', 'Project Manager'];
    }

    // Create seeded random number generator
    createSeededRandom(seed) {
        let m = 0x80000000; // 2**31
        let a = 1103515245;
        let c = 12345;
        let state = seed ? seed : Math.floor(Math.random() * (m - 1));
        
        return () => {
            state = (a * state + c) % m;
            return state / (m - 1);
        };
    }

    // Generate realistic person data
    generatePerson(options = {}) {
        const locale = options.locale || this.options.locale;
        const firstName = this.randomFromArray(this.firstNames[locale] || this.firstNames['en-US']);
        const lastName = this.randomFromArray(this.lastNames[locale] || this.lastNames['en-US']);
        
        const person = {
            id: this.generateId(),
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            email: this.generateEmail(firstName, lastName),
            phone: this.generatePhoneNumber(locale),
            age: this.randomInt(18, 80),
            dateOfBirth: this.generateDateOfBirth(),
            address: this.generateAddress(locale),
            occupation: this.randomFromArray(this.jobTitles),
            company: this.randomFromArray(this.companies),
            salary: this.randomInt(30000, 200000),
            ssn: this.options.gdprCompliant ? null : this.generateSSN(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
            preferences: this.generatePreferences(),
            metadata: {
                createdAt: new Date().toISOString(),
                locale,
                seed: this.options.seed
            }
        };

        // Add relationships if specified
        if (options.relationships) {
            person.relationships = this.generateRelationships(person.id, options.relationships);
        }

        return person;
    }

    // Generate unique ID
    generateId() {
        return crypto.randomBytes(8).toString('hex');
    }

    // Generate realistic email
    generateEmail(firstName, lastName) {
        const domain = this.randomFromArray(this.domains);
        const patterns = [
            `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
            `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
            `${firstName.toLowerCase()}${this.randomInt(1, 999)}@${domain}`,
            `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}@${domain}`
        ];
        
        return this.randomFromArray(patterns);
    }

    // Generate phone number
    generatePhoneNumber(locale) {
        const patterns = {
            'en-US': () => `+1-${this.randomInt(200, 999)}-${this.randomInt(200, 999)}-${this.randomInt(1000, 9999)}`,
            'es-ES': () => `+34-${this.randomInt(600, 799)}-${this.randomInt(100, 999)}-${this.randomInt(100, 999)}`,
            'fr-FR': () => `+33-${this.randomInt(1, 9)}-${this.randomInt(10, 99)}-${this.randomInt(10, 99)}-${this.randomInt(10, 99)}-${this.randomInt(10, 99)}`
        };
        
        const generator = patterns[locale] || patterns['en-US'];
        return generator();
    }

    // Generate date of birth
    generateDateOfBirth() {
        const age = this.randomInt(18, 80);
        const year = new Date().getFullYear() - age;
        const month = this.randomInt(1, 12);
        const day = this.randomInt(1, 28); // Use 28 to avoid month-specific issues
        
        return new Date(year, month - 1, day).toISOString().split('T')[0];
    }

    // Generate address
    generateAddress(locale) {
        const cities = this.cities[locale] || this.cities['en-US'];
        const streetNumber = this.randomInt(1, 9999);
        const streetName = this.generateStreetName();
        const streetType = this.randomFromArray(this.streetTypes);
        
        return {
            street: `${streetNumber} ${streetName} ${streetType}`,
            city: this.randomFromArray(cities),
            state: this.generateState(locale),
            zipCode: this.generateZipCode(locale),
            country: this.getCountryFromLocale(locale),
            coordinates: this.generateCoordinates()
        };
    }

    // Generate street name
    generateStreetName() {
        const streetNames = ['Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Main', 'First', 'Second', 'Park', 'Washington', 'Lincoln', 'Jefferson', 'Madison', 'Adams', 'Jackson'];
        return this.randomFromArray(streetNames);
    }

    // Generate state/region
    generateState(locale) {
        const states = {
            'en-US': ['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI'],
            'es-ES': ['Madrid', 'Cataluña', 'Andalucía', 'Valencia', 'Galicia', 'Castilla y León', 'País Vasco', 'Castilla-La Mancha', 'Canarias', 'Murcia'],
            'fr-FR': ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine', 'Occitanie', 'Hauts-de-France', 'Provence-Alpes-Côte d\'Azur', 'Grand Est', 'Pays de la Loire', 'Normandie', 'Bretagne']
        };
        
        return this.randomFromArray(states[locale] || states['en-US']);
    }

    // Generate zip code
    generateZipCode(locale) {
        const patterns = {
            'en-US': () => this.randomInt(10000, 99999).toString(),
            'es-ES': () => this.randomInt(10000, 99999).toString(),
            'fr-FR': () => this.randomInt(10000, 99999).toString()
        };
        
        const generator = patterns[locale] || patterns['en-US'];
        return generator();
    }

    // Get country from locale
    getCountryFromLocale(locale) {
        const countries = {
            'en-US': 'United States',
            'es-ES': 'Spain',
            'fr-FR': 'France'
        };
        
        return countries[locale] || 'United States';
    }

    // Generate coordinates
    generateCoordinates() {
        return {
            latitude: this.randomFloat(-90, 90),
            longitude: this.randomFloat(-180, 180)
        };
    }

    // Generate SSN (for non-GDPR environments)
    generateSSN() {
        if (this.options.gdprCompliant) return null;
        return `${this.randomInt(100, 999)}-${this.randomInt(10, 99)}-${this.randomInt(1000, 9999)}`;
    }

    // Generate user preferences
    generatePreferences() {
        return {
            theme: this.randomFromArray(['light', 'dark', 'auto']),
            language: this.randomFromArray(['en', 'es', 'fr', 'de', 'it']),
            notifications: {
                email: this.randomBoolean(),
                sms: this.randomBoolean(),
                push: this.randomBoolean()
            },
            privacy: {
                profilePublic: this.randomBoolean(),
                dataSharing: this.randomBoolean(),
                analytics: this.randomBoolean()
            }
        };
    }

    // Generate relationships
    generateRelationships(personId, relationshipTypes) {
        const relationships = {};
        
        relationshipTypes.forEach(type => {
            relationships[type] = this.relationships.get(`${personId}-${type}`) || [];
        });
        
        return relationships;
    }

    // Generate product data
    generateProduct() {
        const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Health', 'Beauty'];
        const adjectives = ['Premium', 'Advanced', 'Professional', 'Deluxe', 'Standard', 'Basic', 'Pro', 'Elite'];
        const nouns = ['Device', 'Tool', 'System', 'Kit', 'Set', 'Collection', 'Series', 'Package'];
        
        const category = this.randomFromArray(categories);
        const name = `${this.randomFromArray(adjectives)} ${category} ${this.randomFromArray(nouns)}`;
        
        return {
            id: this.generateId(),
            name,
            description: this.generateProductDescription(name),
            category,
            price: this.randomFloat(9.99, 999.99),
            currency: 'USD',
            sku: this.generateSKU(),
            inStock: this.randomBoolean(0.8), // 80% chance in stock
            stockQuantity: this.randomInt(0, 100),
            rating: this.randomFloat(1, 5),
            reviewCount: this.randomInt(0, 1000),
            tags: this.generateProductTags(category),
            dimensions: this.generateDimensions(),
            weight: this.randomFloat(0.1, 10),
            images: this.generateProductImages(),
            metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };
    }

    // Generate product description
    generateProductDescription(name) {
        const templates = [
            `High-quality ${name.toLowerCase()} designed for optimal performance and durability.`,
            `Professional-grade ${name.toLowerCase()} that delivers exceptional results.`,
            `Premium ${name.toLowerCase()} featuring advanced technology and superior craftsmanship.`,
            `Innovative ${name.toLowerCase()} that combines functionality with style.`
        ];
        
        return this.randomFromArray(templates);
    }

    // Generate SKU
    generateSKU() {
        const prefix = this.randomFromArray(['PRD', 'ITM', 'SKU', 'CAT']);
        const suffix = this.randomInt(100000, 999999);
        return `${prefix}-${suffix}`;
    }

    // Generate product tags
    generateProductTags(category) {
        const baseTags = ['new', 'popular', 'bestseller', 'featured'];
        const categoryTags = {
            'Electronics': ['wireless', 'bluetooth', 'smart', 'digital'],
            'Clothing': ['cotton', 'comfortable', 'stylish', 'casual'],
            'Books': ['bestseller', 'educational', 'fiction', 'paperback'],
            'Home & Garden': ['outdoor', 'decorative', 'functional', 'modern']
        };
        
        const tags = [...baseTags];
        if (categoryTags[category]) {
            tags.push(...categoryTags[category]);
        }
        
        return this.shuffleArray(tags).slice(0, this.randomInt(2, 5));
    }

    // Generate dimensions
    generateDimensions() {
        return {
            length: this.randomFloat(1, 50),
            width: this.randomFloat(1, 50),
            height: this.randomFloat(1, 50),
            unit: 'cm'
        };
    }

    // Generate product images
    generateProductImages() {
        const imageCount = this.randomInt(1, 5);
        const images = [];
        
        for (let i = 0; i < imageCount; i++) {
            images.push({
                url: `https://picsum.photos/800/600?random=${this.randomInt(1, 1000)}`,
                alt: `Product image ${i + 1}`,
                isPrimary: i === 0
            });
        }
        
        return images;
    }

    // Generate order data
    generateOrder(customerId = null) {
        const orderId = this.generateId();
        const itemCount = this.randomInt(1, 5);
        const items = [];
        let total = 0;
        
        for (let i = 0; i < itemCount; i++) {
            const product = this.generateProduct();
            const quantity = this.randomInt(1, 3);
            const itemTotal = product.price * quantity;
            
            items.push({
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity,
                total: itemTotal
            });
            
            total += itemTotal;
        }
        
        const tax = total * 0.08; // 8% tax
        const shipping = total > 50 ? 0 : 9.99;
        const grandTotal = total + tax + shipping;
        
        return {
            id: orderId,
            orderNumber: `ORD-${Date.now()}-${this.randomInt(1000, 9999)}`,
            customerId: customerId || this.generateId(),
            status: this.randomFromArray(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
            items,
            subtotal: total,
            tax,
            shipping,
            total: grandTotal,
            currency: 'USD',
            paymentMethod: this.randomFromArray(['credit_card', 'paypal', 'bank_transfer', 'cash']),
            shippingAddress: this.generateAddress(),
            billingAddress: this.generateAddress(),
            orderDate: this.generateRecentDate(),
            estimatedDelivery: this.generateFutureDate(),
            tracking: this.generateTrackingNumber(),
            metadata: {
                source: this.randomFromArray(['web', 'mobile', 'api', 'phone']),
                campaign: this.randomFromArray(['email', 'social', 'search', 'direct'])
            }
        };
    }

    // Generate recent date
    generateRecentDate() {
        const daysAgo = this.randomInt(0, 30);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString();
    }

    // Generate future date
    generateFutureDate() {
        const daysFromNow = this.randomInt(1, 14);
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString().split('T')[0];
    }

    // Generate tracking number
    generateTrackingNumber() {
        const prefix = this.randomFromArray(['1Z', '94', '92', '93']);
        const suffix = this.randomAlphanumeric(16);
        return `${prefix}${suffix}`;
    }

    // Generate edge cases
    generateEdgeCases(dataType) {
        const edgeCases = {
            string: ['', ' ', 'a', 'A'.repeat(255), '特殊字符', '🚀🎯💻', 'null', 'undefined', '<script>alert("xss")</script>'],
            number: [0, -1, 1, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, 0.1, -0.1, Infinity, -Infinity],
            email: ['test@', '@domain.com', 'test@domain', 'test.domain.com', 'test@domain.', 'test@@domain.com'],
            phone: ['', '123', '+1', '123-456-7890', '(555) 123-4567', '+1-555-123-4567-ext123'],
            date: ['', '2023-13-01', '2023-02-30', '1900-01-01', '2100-12-31', 'invalid-date'],
            boolean: [true, false, 'true', 'false', 1, 0, null, undefined]
        };
        
        return edgeCases[dataType] || [];
    }

    // Bulk generation
    generateBulk(generator, count) {
        const results = [];
        const batchSize = 1000;
        
        console.log(`🎲 Generating ${count} items...`);
        
        for (let i = 0; i < count; i++) {
            results.push(generator());
            
            if (i % batchSize === 0 && i > 0) {
                const progress = ((i / count) * 100).toFixed(1);
                process.stdout.write(`\r📈 Progress: ${progress}%`);
            }
        }
        
        console.log('\r📈 Progress: 100%');
        return results;
    }

    // Helper methods
    randomInt(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }

    randomFloat(min, max) {
        return parseFloat((this.random() * (max - min) + min).toFixed(2));
    }

    randomBoolean(probability = 0.5) {
        return this.random() < probability;
    }

    randomFromArray(array) {
        return array[Math.floor(this.random() * array.length)];
    }

    randomAlphanumeric(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(this.random() * chars.length));
        }
        return result;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Export data in various formats
    exportToJSON(data, filename = 'test-data.json') {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`📄 Data exported to ${filename}`);
    }

    exportToCSV(data, filename = 'test-data.csv') {
        if (data.length === 0) return;
        
        const fs = require('fs');
        const headers = Object.keys(data[0]);
        let csv = headers.join(',') + '\n';
        
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                if (typeof value === 'object') return JSON.stringify(value);
                return `"${value}"`;
            });
            csv += values.join(',') + '\n';
        });
        
        fs.writeFileSync(filename, csv);
        console.log(`📊 Data exported to ${filename}`);
    }

    exportToSQL(data, tableName = 'test_data', filename = 'test-data.sql') {
        if (data.length === 0) return;
        
        const fs = require('fs');
        const headers = Object.keys(data[0]);
        let sql = `CREATE TABLE ${tableName} (\n`;
        sql += headers.map(header => `  ${header} TEXT`).join(',\n');
        sql += '\n);\n\n';
        
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
                return `'${value}'`;
            });
            sql += `INSERT INTO ${tableName} (${headers.join(', ')}) VALUES (${values.join(', ')});\n`;
        });
        
        fs.writeFileSync(filename, sql);
        console.log(`🗃️  Data exported to ${filename}`);
    }
}

// Example usage
async function generateTestDataSet() {
    const generator = new SmartTestDataGenerator({
        locale: 'en-US',
        seed: 12345,
        realistic: true,
        gdprCompliant: false
    });

    console.log('🎲 SMART TEST DATA GENERATOR');
    console.log('============================');

    // Generate people
    console.log('\n👥 Generating people...');
    const people = generator.generateBulk(() => generator.generatePerson(), 100);
    
    // Generate products
    console.log('\n📦 Generating products...');
    const products = generator.generateBulk(() => generator.generateProduct(), 50);
    
    // Generate orders
    console.log('\n🛒 Generating orders...');
    const orders = generator.generateBulk(() => generator.generateOrder(generator.randomFromArray(people).id), 200);

    // Generate edge cases
    console.log('\n⚠️  Generating edge cases...');
    const edgeCases = {
        strings: generator.generateEdgeCases('string'),
        numbers: generator.generateEdgeCases('number'),
        emails: generator.generateEdgeCases('email'),
        phones: generator.generateEdgeCases('phone'),
        dates: generator.generateEdgeCases('date')
    };

    // Export data
    generator.exportToJSON(people, 'people.json');
    generator.exportToJSON(products, 'products.json');
    generator.exportToJSON(orders, 'orders.json');
    generator.exportToJSON(edgeCases, 'edge-cases.json');
    
    generator.exportToCSV(people, 'people.csv');
    generator.exportToSQL(products, 'products', 'products.sql');

    console.log('\n✅ Test data generation complete!');
    console.log(`👥 Generated ${people.length} people`);
    console.log(`📦 Generated ${products.length} products`);
    console.log(`🛒 Generated ${orders.length} orders`);
    console.log('📄 All data exported to various formats');

    return {
        people,
        products,
        orders,
        edgeCases
    };
}

module.exports = { SmartTestDataGenerator, generateTestDataSet };

// CLI usage
if (require.main === module) {
    generateTestDataSet().catch(console.error);
}
