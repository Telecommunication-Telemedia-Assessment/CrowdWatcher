class CreatePairs < ActiveRecord::Migration[5.0]
  def change
    create_table :pairs do |t|
      t.integer :a
      t.integer :b
      t.integer :count

      t.timestamps
    end
  end
end
