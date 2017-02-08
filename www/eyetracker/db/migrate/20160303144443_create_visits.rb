class CreateVisits < ActiveRecord::Migration
  def change
    create_table :visits do |t|
      t.string :u_id
      t.string :mw_id

      t.timestamps null: false
    end
  end
end
