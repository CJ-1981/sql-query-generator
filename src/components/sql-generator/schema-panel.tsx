"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Database, BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXAMPLE_SCHEMAS: Record<string, string> = {
  ecommerce: `-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Products table
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  stock_quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items table
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);`,
  blog: `-- Authors table
CREATE TABLE authors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  author_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES authors(id)
);

-- Tags table
CREATE TABLE tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Post Tags junction table
CREATE TABLE post_tags (
  post_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);`,
  hr: `-- Departments table
CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  budget DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  department_id INT NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  salary DECIMAL(10,2) NOT NULL,
  hire_date DATE NOT NULL,
  manager_id INT,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (manager_id) REFERENCES employees(id)
);

-- Projects table
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  department_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(12,2),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Employee Projects junction table
CREATE TABLE employee_projects (
  employee_id INT NOT NULL,
  project_id INT NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  hours_worked INT DEFAULT 0,
  PRIMARY KEY (employee_id, project_id),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);`,
};

interface SchemaPanelProps {
  schema: string;
  onSchemaChange: (value: string) => void;
}

export function SchemaPanel({ schema, onSchemaChange }: SchemaPanelProps) {
  const handleLoadExample = (value: string) => {
    if (value && EXAMPLE_SCHEMAS[value]) {
      onSchemaChange(EXAMPLE_SCHEMAS[value]);
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-emerald-600" />
          <Label htmlFor="schema-input" className="text-sm font-semibold">
            Database Schema
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Select onValueChange={handleLoadExample}>
            <SelectTrigger className="w-auto h-8 text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Load Example" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ecommerce">E-Commerce</SelectItem>
              <SelectItem value="blog">Blog Platform</SelectItem>
              <SelectItem value="hr">HR Management</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Textarea
        id="schema-input"
        value={schema}
        onChange={(e) => onSchemaChange(e.target.value)}
        placeholder="Paste your SQL schema here (CREATE TABLE statements)..."
        className="flex-1 min-h-[200px] font-mono text-sm resize-none bg-muted/30 border-emerald-200/50 focus-visible:ring-emerald-500/30"
        spellCheck={false}
      />
    </div>
  );
}
