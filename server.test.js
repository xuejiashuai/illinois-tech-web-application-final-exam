// Simple tests for CI/CD pipeline

describe('Basic Tests', () => {
    
    // Test that server.js can be loaded without errors
    test('server.js syntax is valid', () => {
        expect(() => {
            require('./server.js');
        }).not.toThrow();
    });

    // Test that required modules exist
    test('express module exists', () => {
        const express = require('express');
        expect(express).toBeDefined();
    });

    test('mysql2 module exists', () => {
        const mysql = require('mysql2');
        expect(mysql).toBeDefined();
    });

    // Basic math test (sanity check)
    test('basic functionality works', () => {
        expect(1 + 1).toBe(2);
    });
});
